import os
import stripe
from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SubscriptionPlan, UserSubscription, PaymentHistory, SubscriptionUsage
from .serializers import (
    SubscriptionPlanSerializer, UserSubscriptionSerializer, PaymentHistorySerializer,
    SubscriptionUsageSerializer, CreatePaymentIntentSerializer, SubscriptionStatusSerializer,
    UpgradeSubscriptionSerializer
)

User = get_user_model()

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


class SubscriptionPlanListView(generics.ListAPIView):
    """List all available subscription plans"""
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


class UserSubscriptionStatusView(APIView):
    """Get current user's subscription status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            subscription = UserSubscription.objects.get(user=request.user)
            usage, created = SubscriptionUsage.objects.get_or_create(subscription=subscription)
            usage.reset_daily_limits()
            
            data = {
                'is_premium': subscription.is_premium,
                'plan_name': subscription.plan.get_name_display(),
                'status': subscription.status,
                'days_remaining': subscription.days_remaining,
                'end_date': subscription.end_date,
                'can_create_trip': usage.can_create_trip(),
                'can_use_chatbot': usage.can_use_chatbot(),
                'trips_created': usage.trips_created,
                'chatbot_messages': usage.chatbot_messages,
            }
            
            serializer = SubscriptionStatusSerializer(data)
            return Response(serializer.data)
            
        except UserSubscription.DoesNotExist:
            # Create free subscription for new users
            free_plan = SubscriptionPlan.objects.get(name='free')
            subscription = UserSubscription.objects.create(
                user=request.user,
                plan=free_plan
            )
            usage = SubscriptionUsage.objects.create(subscription=subscription)
            
            data = {
                'is_premium': False,
                'plan_name': 'Free',
                'status': 'active',
                'days_remaining': None,  # Free plans don't expire
                'end_date': None,  # Free plans have no end date
                'can_create_trip': True,
                'can_use_chatbot': True,
                'trips_created': 0,
                'chatbot_messages': 0,
            }
            
            serializer = SubscriptionStatusSerializer(data)
            return Response(serializer.data)


class CreatePaymentIntentView(APIView):
    """Create Stripe payment intent for subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        if serializer.is_valid():
            plan_id = serializer.validated_data['plan_id']
            plan = SubscriptionPlan.objects.get(id=plan_id)
            
            try:
                # Get or create Stripe customer
                subscription = UserSubscription.objects.get(user=request.user)
                if not subscription.stripe_customer_id:
                    customer = stripe.Customer.create(
                        email=request.user.email,
                        name=f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                        metadata={'user_id': request.user.id}
                    )
                    subscription.stripe_customer_id = customer.id
                    subscription.save()
                else:
                    customer = stripe.Customer.retrieve(subscription.stripe_customer_id)
                
                # Create payment intent
                intent = stripe.PaymentIntent.create(
                    amount=int(plan.price * 100),  # Convert to cents
                    currency='usd',
                    customer=customer.id,
                    metadata={
                        'user_id': request.user.id,
                        'plan_id': plan.id,
                        'plan_name': plan.name
                    }
                )
                
                return Response({
                    'client_secret': intent.client_secret,
                    'payment_intent_id': intent.id
                })
                
            except Exception as e:
                return Response(
                    {'error': f'Failed to create payment intent: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmPaymentView(APIView):
    """Confirm payment and upgrade subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response(
                {'error': 'Payment intent ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Retrieve payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status != 'succeeded':
                return Response(
                    {'error': 'Payment not completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            plan_id = intent.metadata.get('plan_id')
            plan = SubscriptionPlan.objects.get(id=plan_id)
            
            with transaction.atomic():
                # Update user subscription
                subscription = UserSubscription.objects.get(user=request.user)
                subscription.plan = plan
                subscription.status = 'active'
                subscription.start_date = timezone.now()
                subscription.end_date = timezone.now() + timezone.timedelta(days=plan.duration_days)
                subscription.save()
                
                # Create payment history record
                PaymentHistory.objects.create(
                    user=request.user,
                    subscription=subscription,
                    amount=plan.price,
                    status='completed',
                    stripe_payment_intent_id=payment_intent_id,
                    transaction_id=f"pi_{payment_intent_id}",
                    metadata=intent.metadata
                )
            
            return Response({
                'message': 'Payment confirmed and subscription upgraded successfully',
                'subscription': UserSubscriptionSerializer(subscription).data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to confirm payment: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PaymentHistoryView(generics.ListAPIView):
    """List user's payment history"""
    serializer_class = PaymentHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentHistory.objects.filter(user=self.request.user)


class CancelSubscriptionView(APIView):
    """Cancel user's subscription"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            subscription = UserSubscription.objects.get(user=request.user)
            
            # Cancel Stripe subscription if exists
            if subscription.stripe_subscription_id:
                stripe.Subscription.delete(subscription.stripe_subscription_id)
            
            # Downgrade to free plan
            free_plan = SubscriptionPlan.objects.get(name='free')
            subscription.plan = free_plan
            subscription.status = 'cancelled'
            subscription.auto_renew = False
            subscription.stripe_subscription_id = None
            subscription.save()
            
            return Response({
                'message': 'Subscription cancelled successfully',
                'subscription': UserSubscriptionSerializer(subscription).data
            })
            
        except UserSubscription.DoesNotExist:
            return Response(
                {'error': 'No active subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to cancel subscription: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Handle successful payment
        handle_successful_payment(payment_intent)
    
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        # Handle successful subscription renewal
        handle_subscription_renewal(invoice)
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # Handle subscription cancellation
        handle_subscription_cancellation(subscription)
    
    return Response({'status': 'success'})


def handle_successful_payment(payment_intent):
    """Handle successful payment from webhook"""
    try:
        user_id = payment_intent['metadata'].get('user_id')
        if user_id:
            user = User.objects.get(id=user_id)
            subscription = UserSubscription.objects.get(user=user)
            
            # Update payment history
            PaymentHistory.objects.filter(
                stripe_payment_intent_id=payment_intent['id']
            ).update(status='completed')
            
    except (User.DoesNotExist, UserSubscription.DoesNotExist):
        pass


def handle_subscription_renewal(invoice):
    """Handle subscription renewal from webhook"""
    try:
        customer_id = invoice['customer']
        subscription = UserSubscription.objects.get(stripe_customer_id=customer_id)
        
        # Extend subscription period
        subscription.end_date = timezone.now() + timezone.timedelta(
            days=subscription.plan.duration_days
        )
        subscription.status = 'active'
        subscription.save()
        
        # Create payment history record
        PaymentHistory.objects.create(
            user=subscription.user,
            subscription=subscription,
            amount=Decimal(invoice['amount_paid']) / 100,
            status='completed',
            stripe_invoice_id=invoice['id'],
            transaction_id=f"in_{invoice['id']}",
            metadata={'renewal': True}
        )
        
    except UserSubscription.DoesNotExist:
        pass


def handle_subscription_cancellation(stripe_subscription):
    """Handle subscription cancellation from webhook"""
    try:
        subscription = UserSubscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        
        # Downgrade to free plan
        free_plan = SubscriptionPlan.objects.get(name='free')
        subscription.plan = free_plan
        subscription.status = 'cancelled'
        subscription.auto_renew = False
        subscription.stripe_subscription_id = None
        subscription.save()
        
    except UserSubscription.DoesNotExist:
        pass