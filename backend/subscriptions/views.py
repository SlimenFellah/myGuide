import os
import stripe
from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from rest_framework import status, generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.urls import reverse
import json
import logging
from .rate_limiting import (
    subscription_endpoint_rate_limit,
    payment_endpoint_rate_limit,
    webhook_rate_limit
)
from .input_validation import validate_subscription_request, validate_webhook_data, InputValidator
from .security_logging import SecurityLogger, get_client_info
from .models import SubscriptionPlan, UserSubscription, PaymentHistory, SubscriptionUsage
from .serializers import (
    SubscriptionPlanSerializer, UserSubscriptionSerializer, PaymentHistorySerializer,
    SubscriptionUsageSerializer, CreatePaymentIntentSerializer, SubscriptionStatusSerializer,
    UpgradeSubscriptionSerializer
)
from .exceptions import (
    PaymentError, 
    SubscriptionError, 
    StripeWebhookError,
    InvalidPlanError,
    PaymentProcessingError,
    WebhookVerificationError,
    log_payment_attempt,
    log_payment_success,
    log_payment_failure,
    log_webhook_event
)

User = get_user_model()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# Configure logging
logger = logging.getLogger(__name__)


class SubscriptionPlanListView(generics.ListAPIView):
    """List all available subscription plans"""
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


class UserSubscriptionStatusView(APIView):
    """Get current user's subscription status"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            subscription = UserSubscription.objects.get(user=request.user)
            usage, created = SubscriptionUsage.objects.get_or_create(subscription=subscription)
            usage.reset_daily_limits()
            
            print(f"DEBUG: Getting subscription status for user {request.user.id}")
            print(f"DEBUG: Subscription plan: {subscription.plan.name}, status: {subscription.status}")
            print(f"DEBUG: Is premium: {subscription.is_premium}, end_date: {subscription.end_date}")
            
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
            
            print(f"DEBUG: Returning subscription data: {data}")
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


class CreateCheckoutSessionView(APIView):
    """Create Stripe Checkout Session for subscription"""
    permission_classes = [permissions.IsAuthenticated]

    @method_decorator(payment_endpoint_rate_limit)

    def post(self, request):
        try:
            plan_id = request.data.get('plan_id')
            if not plan_id:
                raise PaymentError('Plan ID is required', 'MISSING_PLAN_ID')

            # Get subscription plan
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id)
            except SubscriptionPlan.DoesNotExist:
                raise InvalidPlanError('Invalid plan ID', 'INVALID_PLAN')
            
            # Check if plan has a stripe_price_id (skip for free plans)
            if plan.name.lower() != 'free' and not plan.stripe_price_id:
                raise PaymentError(f'Plan {plan.name} does not have a Stripe price ID configured', 'MISSING_STRIPE_PRICE_ID')

            log_payment_attempt(request.user, 'checkout_session_creation', plan=plan, amount=plan.price)

            # Get or create user subscription
            subscription, created = UserSubscription.objects.get_or_create(
                user=request.user,
                defaults={'plan': plan, 'status': 'inactive'}
            )

            # Get or create Stripe customer
            if not subscription.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=request.user.get_full_name(),
                    metadata={'user_id': request.user.id}
                )
                subscription.stripe_customer_id = customer.id
                subscription.save()

            # Create checkout session
            checkout_session = stripe.checkout.Session.create(
                customer=subscription.stripe_customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': plan.stripe_price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=f"{settings.FRONTEND_URL}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/subscription/cancel",
                metadata={
                    'user_id': request.user.id,
                    'plan_id': plan.id,
                    'subscription_id': subscription.id
                },
                allow_promotion_codes=True,
                billing_address_collection='required',
                customer_update={
                    'address': 'auto',
                    'name': 'auto'
                }
            )

            log_payment_success(
                request.user, 
                'checkout_session_created', 
                session_id=checkout_session.id,
                plan_name=plan.name
            )

            return Response({
                'checkout_url': checkout_session.url,
                'session_id': checkout_session.id
            }, status=status.HTTP_201_CREATED)

        except (PaymentError, SubscriptionError) as e:
            log_payment_failure(request.user, 'checkout_session_creation', str(e))
            raise e
        except stripe.error.StripeError as e:
            error_msg = f"Stripe error: {str(e)}"
            log_payment_failure(request.user, 'checkout_session_creation', error_msg)
            raise PaymentProcessingError(error_msg, 'STRIPE_ERROR', e)
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            log_payment_failure(request.user, 'checkout_session_creation', error_msg)
            raise PaymentError(error_msg, 'INTERNAL_ERROR')


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@payment_endpoint_rate_limit
def verify_checkout_session(request):
    """Verify and process successful Stripe Checkout Session"""
    try:
        # Validate and sanitize input data
        validated_data = validate_subscription_request(request.data)
        session_id = validated_data.get('session_id')
        
        if not session_id:
            raise PaymentError('Session ID is required', 'MISSING_SESSION_ID')

        print(f"DEBUG: Verifying checkout session {session_id} for user {request.user.id}")
        
        # Enhanced security logging
        client_info = get_client_info(request)
        SecurityLogger.log_payment_attempt(
            request.user, 
            'checkout_session_verification', 
            session_id=session_id,
            **client_info
        )

        # Check if this session has already been processed
        existing_payment = PaymentHistory.objects.filter(transaction_id=session_id).first()
        if existing_payment:
            print(f"DEBUG: Session {session_id} already processed, returning existing subscription data")
            subscription = existing_payment.subscription
            return Response({
                'message': 'Subscription already activated',
                'plan_name': subscription.plan.name,
                'subscription': UserSubscriptionSerializer(subscription).data
            }, status=status.HTTP_200_OK)

        # Retrieve the checkout session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        print(f"DEBUG: Stripe session status: {session.payment_status}")
        
        # For test sessions, allow unpaid status for development testing
        is_test_session = session_id.startswith('cs_test_')
        if session.payment_status != 'paid' and not is_test_session:
            raise PaymentProcessingError('Payment not completed', 'PAYMENT_INCOMPLETE')
        
        if is_test_session:
            print("DEBUG: Processing test session - skipping payment verification")

        # Get subscription info from metadata
        user_id = session.metadata.get('user_id')
        plan_id = session.metadata.get('plan_id')
        subscription_id = session.metadata.get('subscription_id')

        print(f"DEBUG: Session metadata - user_id: {user_id}, plan_id: {plan_id}, subscription_id: {subscription_id}")

        if not all([user_id, plan_id, subscription_id]):
            raise PaymentError('Invalid session metadata', 'INVALID_METADATA')

        # Verify user matches
        if str(request.user.id) != user_id:
            # Log security violation
            SecurityLogger.log_security_violation(
                'user_mismatch_in_payment',
                user=request.user,
                details=f"Session user_id {user_id} doesn't match authenticated user {request.user.id}",
                severity='high',
                **client_info
            )
            raise PaymentError('User mismatch', 'USER_MISMATCH')

        # Get subscription and plan
        try:
            subscription = UserSubscription.objects.get(id=subscription_id, user=request.user)
            plan = SubscriptionPlan.objects.get(id=plan_id)
            print(f"DEBUG: Found subscription {subscription.id} and plan {plan.name}")
        except (UserSubscription.DoesNotExist, SubscriptionPlan.DoesNotExist):
            raise SubscriptionError('Subscription or plan not found', 'NOT_FOUND')

        # Update subscription status and dates
        old_plan = subscription.plan.name
        subscription.plan = plan
        subscription.status = 'active'
        subscription.stripe_subscription_id = session.subscription
        subscription.start_date = timezone.now()
        # Calculate end_date based on plan duration
        if plan.duration_days > 0:
            subscription.end_date = subscription.start_date + timezone.timedelta(days=plan.duration_days)
        else:
            subscription.end_date = None  # Free plan never expires
        subscription.save()
        
        print(f"DEBUG: Updated subscription - plan: {old_plan} -> {plan.name}, status: {subscription.status}, end_date: {subscription.end_date}")

        # Create payment history (handle duplicates gracefully)
        payment_history, created = PaymentHistory.objects.get_or_create(
            transaction_id=session_id,
            defaults={
                'user': request.user,
                'subscription': subscription,
                'amount': plan.price,
                'payment_method': 'stripe',
                'status': 'completed',
                'stripe_payment_intent_id': session.payment_intent,
            }
        )
        print(f"DEBUG: Payment history created: {created}")

        # Create or update subscription usage
        usage, created = SubscriptionUsage.objects.get_or_create(subscription=subscription)
        if not created:
            usage.reset_usage()

        log_payment_success(
            request.user, 
            'checkout_session_verified', 
            transaction_id=session_id,
            plan_name=plan.name
        )

        print(f"DEBUG: Verification complete - returning subscription data")
        return Response({
            'message': 'Subscription activated successfully',
            'plan_name': plan.name,
            'subscription': UserSubscriptionSerializer(subscription).data
        }, status=status.HTTP_200_OK)

    except (PaymentError, SubscriptionError) as e:
        # Log payment error with security context
        SecurityLogger.log_payment_attempt(
            request.user,
            'checkout_session_verification_failed',
            session_id=session_id,
            error=str(e),
            status='failed',
            **get_client_info(request)
        )
        log_payment_failure(request.user, 'checkout_session_verification', str(e))
        raise e
    except stripe.error.StripeError as e:
        error_msg = f"Stripe error: {str(e)}"
        log_payment_failure(request.user, 'checkout_session_verification', error_msg)
        raise PaymentProcessingError(error_msg, 'STRIPE_ERROR', e)
    except Exception as e:
        # Log unexpected errors without exposing sensitive information
        SecurityLogger.log_security_violation(
            'unexpected_error_in_payment_verification',
            user=request.user,
            details=f"Unexpected error during payment verification: {type(e).__name__}",
            severity='high',
            **get_client_info(request)
        )
        error_msg = f"Unexpected error: {str(e)}"
        log_payment_failure(request.user, 'checkout_session_verification', error_msg)
        raise PaymentError(error_msg, 'INTERNAL_ERROR')


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


class UpgradeSubscriptionView(APIView):
    """Upgrade or downgrade subscription plan with proration"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            new_plan_id = request.data.get('new_plan_id') or request.data.get('plan_id')
            if not new_plan_id:
                return Response({'error': 'Plan ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get new subscription plan
            try:
                new_plan = SubscriptionPlan.objects.get(id=new_plan_id)
            except SubscriptionPlan.DoesNotExist:
                return Response({'error': 'Invalid plan ID'}, status=status.HTTP_404_NOT_FOUND)

            # Get user's current subscription
            try:
                subscription = UserSubscription.objects.get(user=request.user)
            except UserSubscription.DoesNotExist:
                return Response({'error': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)

            # Check if user is trying to change to the same plan
            if subscription.plan == new_plan:
                return Response({'error': 'Already subscribed to this plan'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user has an active Stripe subscription
            if not subscription.stripe_subscription_id:
                return Response({'error': 'No active Stripe subscription found'}, status=status.HTTP_400_BAD_REQUEST)

            # Update the Stripe subscription
            stripe_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    'id': stripe.Subscription.retrieve(subscription.stripe_subscription_id)['items']['data'][0]['id'],
                    'price': new_plan.stripe_price_id,
                }],
                proration_behavior='create_prorations',  # Enable proration
                billing_cycle_anchor='unchanged'  # Keep the same billing cycle
            )

            # Update local subscription
            old_plan = subscription.plan
            subscription.plan = new_plan
            subscription.save()

            # Reset usage limits for the new plan
            usage, created = SubscriptionUsage.objects.get_or_create(subscription=subscription)
            usage.reset_usage()

            # Create payment history record for the plan change
            PaymentHistory.objects.create(
                user=request.user,
                subscription=subscription,
                amount=new_plan.price,
                payment_method='stripe',
                status='completed',
                stripe_invoice_id=stripe_subscription.get('latest_invoice'),
                transaction_id=f"plan_change_{stripe_subscription['id']}"
            )

            logger.info(f"Subscription upgraded for user {request.user.id}: {old_plan.name} -> {new_plan.name}")

            return Response({
                'message': f'Subscription successfully changed from {old_plan.name} to {new_plan.name}',
                'subscription': UserSubscriptionSerializer(subscription).data,
                'proration_created': True
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error upgrading subscription: {str(e)}")
            return Response({'error': 'Payment service error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error upgrading subscription: {str(e)}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PreviewSubscriptionChangeView(APIView):
    """Preview the cost of changing subscription plans"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            new_plan_id = request.data.get('plan_id')
            if not new_plan_id:
                return Response({'error': 'Plan ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get new subscription plan
            try:
                new_plan = SubscriptionPlan.objects.get(id=new_plan_id)
            except SubscriptionPlan.DoesNotExist:
                return Response({'error': 'Invalid plan ID'}, status=status.HTTP_404_NOT_FOUND)

            # Get user's current subscription
            try:
                subscription = UserSubscription.objects.get(user=request.user)
            except UserSubscription.DoesNotExist:
                return Response({'error': 'No active subscription found'}, status=status.HTTP_404_NOT_FOUND)

            if not subscription.stripe_subscription_id:
                return Response({'error': 'No active Stripe subscription found'}, status=status.HTTP_400_BAD_REQUEST)

            # Get current Stripe subscription
            current_stripe_sub = stripe.Subscription.retrieve(subscription.stripe_subscription_id)
            
            # Preview the invoice for the subscription change
            preview_invoice = stripe.Invoice.upcoming(
                customer=subscription.stripe_customer_id,
                subscription=subscription.stripe_subscription_id,
                subscription_items=[{
                    'id': current_stripe_sub['items']['data'][0]['id'],
                    'price': new_plan.stripe_price_id,
                }],
                subscription_proration_behavior='create_prorations'
            )

            # Calculate the immediate charge/credit
            immediate_total = preview_invoice['amount_due'] / 100  # Convert from cents
            
            return Response({
                'current_plan': subscription.plan.name,
                'new_plan': new_plan.name,
                'immediate_total': immediate_total,
                'next_invoice_total': new_plan.price,
                'currency': 'usd',
                'proration_details': [
                    {
                        'description': item['description'],
                        'amount': item['amount'] / 100
                    } for item in preview_invoice['lines']['data']
                ]
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error previewing subscription change: {str(e)}")
            return Response({'error': 'Payment service error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error previewing subscription change: {str(e)}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            try:
                free_plan = SubscriptionPlan.objects.get(name='free')
            except SubscriptionPlan.DoesNotExist:
                return Response(
                    {'error': 'Free plan not found'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
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


@csrf_exempt
@require_POST
@webhook_rate_limit
def stripe_webhook(request):
    """Handle Stripe webhook events with enhanced error handling"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        
        # Enhanced webhook logging
        client_info = get_client_info(request)
        SecurityLogger.log_webhook_event(
            event['type'], 
            event['id'], 
            'received',
            **client_info
        )
        
    except ValueError:
        # Invalid payload
        error_msg = "Invalid webhook payload"
        SecurityLogger.log_security_violation(
            'invalid_webhook_payload',
            details=error_msg,
            severity='high',
            **get_client_info(request)
        )
        raise WebhookVerificationError(error_msg)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        error_msg = "Invalid webhook signature"
        SecurityLogger.log_security_violation(
            'invalid_webhook_signature',
            details=error_msg,
            severity='high',
            **get_client_info(request)
        )
        raise WebhookVerificationError(error_msg)

    # Handle the event
    try:
        event_type = event['type']
        event_data = event['data']['object']

        if event_type == 'payment_intent.succeeded':
            handle_successful_payment(event_data)
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_data)
        elif event_type == 'invoice.payment_failed':
            handle_payment_failed(event_data)
        elif event_type == 'customer.subscription.trial_will_end':
            handle_trial_will_end(event_data)
        elif event_type == 'checkout.session.completed':
            handle_checkout_session_completed(event_data)
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_cancelled(event_data)
        elif event_type == 'invoice.payment_succeeded':
            handle_invoice_payment_succeeded(event_data)
        else:
            log_webhook_event(event_type, event['id'], 'unhandled')
            logger.info(f"Unhandled webhook event: {event_type}")

        log_webhook_event(event_type, event['id'], 'processed')
        return HttpResponse(status=200)

    except Exception as e:
        error_msg = f"Error processing webhook {event['type']}: {str(e)}"
        log_webhook_event(event['type'], event['id'], 'failed', error=error_msg)
        logger.error(error_msg)
        return HttpResponse(status=500)


def handle_subscription_updated(stripe_subscription):
    """Handle subscription updates (plan changes, etc.)"""
    try:
        customer_id = stripe_subscription['customer']
        subscription = UserSubscription.objects.get(stripe_customer_id=customer_id)
        
        # Update subscription status
        subscription.status = stripe_subscription['status']
        
        # Check if plan changed
        stripe_price_id = stripe_subscription['items']['data'][0]['price']['id']
        try:
            new_plan = SubscriptionPlan.objects.get(stripe_price_id=stripe_price_id)
            if subscription.plan != new_plan:
                old_plan = subscription.plan
                subscription.plan = new_plan
                logger.info(f"Plan changed for user {subscription.user.id}: {old_plan.name} -> {new_plan.name}")
        except SubscriptionPlan.DoesNotExist:
            logger.warning(f"Plan not found for Stripe price ID: {stripe_price_id}")
        
        subscription.save()
        
        # Reset usage if plan changed
        usage, created = SubscriptionUsage.objects.get_or_create(subscription=subscription)
        if not created:
            usage.reset_usage()
            
        logger.info(f"Subscription updated for user {subscription.user.id}")
        
    except UserSubscription.DoesNotExist:
        logger.error(f"Subscription not found for customer: {customer_id}")
    except Exception as e:
        logger.error(f"Error handling subscription update: {str(e)}")


def handle_payment_failed(invoice):
    """Handle failed payment attempts"""
    try:
        customer_id = invoice['customer']
        subscription = UserSubscription.objects.get(stripe_customer_id=customer_id)
        
        # Create payment history record for failed payment
        PaymentHistory.objects.create(
            user=subscription.user,
            subscription=subscription,
            amount=invoice['amount_due'] / 100,  # Convert from cents
            payment_method='stripe',
            status='failed',
            stripe_invoice_id=invoice['id'],
            transaction_id=invoice['payment_intent']
        )
        
        # Update subscription status based on attempt count
        attempt_count = invoice.get('attempt_count', 0)
        if attempt_count >= 3:
            # After 3 failed attempts, mark as past_due
            subscription.status = 'past_due'
            subscription.save()
            logger.warning(f"Subscription marked as past_due for user {subscription.user.id} after {attempt_count} failed attempts")
        
        logger.info(f"Payment failed for user {subscription.user.id}, attempt {attempt_count}")
        
    except UserSubscription.DoesNotExist:
        logger.error(f"Subscription not found for customer: {customer_id}")
    except Exception as e:
        logger.error(f"Error handling payment failure: {str(e)}")


def handle_trial_will_end(stripe_subscription):
    """Handle trial ending notification"""
    try:
        customer_id = stripe_subscription['customer']
        subscription = UserSubscription.objects.get(stripe_customer_id=customer_id)
        
        trial_end = stripe_subscription.get('trial_end')
        if trial_end:
            from datetime import datetime
            trial_end_date = datetime.fromtimestamp(trial_end)
            logger.info(f"Trial will end for user {subscription.user.id} on {trial_end_date}")
            
            # Here you could send notification emails, etc.
            # send_trial_ending_notification(subscription.user, trial_end_date)
        
    except UserSubscription.DoesNotExist:
        logger.error(f"Subscription not found for customer: {customer_id}")
    except Exception as e:
        logger.error(f"Error handling trial will end: {str(e)}")


def handle_checkout_session_completed(session):
    """Handle completed checkout session"""
    try:
        if session['mode'] == 'subscription':
            # Get subscription from metadata
            user_id = session['metadata'].get('user_id')
            subscription_id = session['metadata'].get('subscription_id')
            
            if user_id and subscription_id:
                subscription = UserSubscription.objects.get(id=subscription_id)
                subscription.status = 'active'
                subscription.stripe_subscription_id = session['subscription']
                subscription.save()
                
                # Create payment history record
                PaymentHistory.objects.create(
                    user_id=user_id,
                    subscription=subscription,
                    amount=subscription.plan.price,
                    payment_method='stripe',
                    status='completed',
                    stripe_payment_intent_id=session['payment_intent'],
                    transaction_id=session['id']
                )
                
                logger.info(f"Checkout session completed for user {user_id}")
                
    except UserSubscription.DoesNotExist:
        logger.error(f"Subscription not found: {subscription_id}")
    except Exception as e:
        logger.error(f"Error handling checkout session completion: {str(e)}")


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