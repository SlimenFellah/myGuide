"""
Tests for payment flows and subscription management
"""
import json
from unittest.mock import patch, Mock
from decimal import Decimal
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import stripe

from ..models import SubscriptionPlan, UserSubscription, PaymentHistory, SubscriptionUsage
from ..exceptions import PaymentError, SubscriptionError, InvalidPlanError

User = get_user_model()


class PaymentFlowTestCase(APITestCase):
    """Test payment flows and subscription management"""

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.free_plan = SubscriptionPlan.objects.create(
            name='free',
            price=Decimal('0.00'),
            duration_days=0,
            stripe_price_id='price_free'
        )
        
        self.premium_plan = SubscriptionPlan.objects.create(
            name='monthly',
            price=Decimal('9.99'),
            duration_days=30,
            stripe_price_id='price_premium'
        )
        
        self.client.force_authenticate(user=self.user)

    def test_create_checkout_session_success(self):
        """Test successful checkout session creation"""
        with patch('stripe.Customer.create') as mock_customer, \
             patch('stripe.checkout.Session.create') as mock_session:
            
            mock_customer.return_value = Mock(id='cus_test123')
            mock_session.return_value = Mock(
                id='cs_test123',
                url='https://checkout.stripe.com/pay/cs_test123'
            )
            
            response = self.client.post(
                reverse('subscriptions:create-checkout-session'),
                {'plan_id': self.premium_plan.id},
                format='json'
            )
            
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertIn('checkout_url', response.data)
            self.assertIn('session_id', response.data)

    def test_create_checkout_session_invalid_plan(self):
        """Test checkout session creation with invalid plan"""
        response = self.client.post(
            reverse('subscriptions:create-checkout-session'),
            {'plan_id': 999}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_checkout_session_missing_plan_id(self):
        """Test checkout session creation without plan ID"""
        response = self.client.post(reverse('subscriptions:create-checkout-session'), {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_verify_checkout_session_success(self):
        """Test successful checkout session verification"""
        # Create subscription
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.premium_plan,
            status='pending'
        )
        
        with patch('stripe.checkout.Session.retrieve') as mock_retrieve:
            mock_retrieve.return_value = Mock(
                payment_status='paid',
                subscription='sub_test123',
                payment_intent='pi_test123',
                metadata={
                    'user_id': str(self.user.id),
                    'plan_id': str(self.premium_plan.id),
                    'subscription_id': str(subscription.id)
                }
            )
            
            response = self.client.post(
                reverse('subscriptions:verify-checkout-session'),
                {'session_id': 'cs_test123'},
                format='json'
            )
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Check subscription was updated
            subscription.refresh_from_db()
            self.assertEqual(subscription.status, 'active')
            self.assertEqual(subscription.stripe_subscription_id, 'sub_test123')
            
            # Check payment history was created
            self.assertTrue(
                PaymentHistory.objects.filter(
                    user=self.user,
                    status='completed'
                ).exists()
            )

    def test_upgrade_subscription_success(self):
        """Test successful subscription upgrade"""
        # Create active subscription
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.free_plan,
            status='active',
            stripe_subscription_id='sub_test123',
            stripe_customer_id='cus_test123'
        )
        
        with patch('stripe.Subscription.retrieve') as mock_retrieve, \
             patch('stripe.Subscription.modify') as mock_modify:
            
            mock_retrieve.return_value = {
                'items': {'data': [{'id': 'si_test123'}]}
            }
            mock_modify.return_value = {
                'id': 'sub_test123',
                'latest_invoice': 'in_test123'
            }
            
            response = self.client.post(
                reverse('subscriptions:upgrade_subscription'),
                {'plan_id': self.premium_plan.id},
                format='json'
            )
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Check subscription was updated
            subscription.refresh_from_db()
            self.assertEqual(subscription.plan, self.premium_plan)

    def test_preview_subscription_change(self):
        """Test subscription change preview"""
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.free_plan,
            status='active',
            stripe_subscription_id='sub_test123',
            stripe_customer_id='cus_test123'
        )
        
        with patch('stripe.Subscription.retrieve') as mock_retrieve, \
             patch('stripe.Invoice') as mock_invoice_class:
            
            # Create proper Stripe objects using convert_to_stripe_object
            mock_retrieve.return_value = stripe.convert_to_stripe_object({
                'items': {'data': [{'id': 'si_test123'}]}
            })
            
            # Mock the upcoming method on the Invoice class
            mock_invoice_class.upcoming.return_value = stripe.convert_to_stripe_object({
                'amount_due': 999,  # $9.99 in cents
                'lines': {
                    'data': [
                        {
                            'description': 'Proration for plan change',
                            'amount': 999
                        }
                    ]
                }
            })
            
            response = self.client.post(
                reverse('subscriptions:preview_subscription_change'),
                {'plan_id': self.premium_plan.id}
            )
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['immediate_total'], 9.99)
            self.assertEqual(response.data['new_plan'], 'monthly')

    def test_cancel_subscription_success(self):
        """Test successful subscription cancellation"""
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.premium_plan,
            status='active',
            stripe_subscription_id='sub_test123'
        )
        
        with patch('stripe.Subscription.delete') as mock_delete:
            mock_delete.return_value = None
            
            response = self.client.post(reverse('subscriptions:cancel_subscription'))
            
            # Debug: print response content if test fails
            if response.status_code != status.HTTP_200_OK:
                print(f"Response status: {response.status_code}")
                print(f"Response data: {response.data}")
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            
            # Check subscription status
            subscription.refresh_from_db()
            self.assertEqual(subscription.status, 'cancelled')

    def test_payment_history_view(self):
        """Test payment history retrieval"""
        # Clear any existing payment history for this user
        PaymentHistory.objects.filter(user=self.user).delete()
        
        # Create a subscription for the test
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.premium_plan,
            status='active',
            stripe_subscription_id='sub_test123'
        )
        
        PaymentHistory.objects.create(
            user=self.user,
            subscription=subscription,
            amount=Decimal('9.99'),
            status='completed',
            payment_method='stripe',
            transaction_id='txn_test123'
        )
        
        response = self.client.get(reverse('subscriptions:payment-history'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['amount'], '9.99')

    def test_subscription_usage_limits(self):
        """Test subscription usage tracking"""
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.free_plan,
            status='active'
        )
        
        usage = SubscriptionUsage.objects.create(
            subscription=subscription,
            trips_created=2,
            chatbot_messages=5
        )
        
        # Test free plan limits
        self.assertTrue(usage.can_create_trip())  # 2 < 3 limit
        self.assertTrue(usage.can_use_chatbot())  # 5 < 10 limit
        
        # Exceed limits
        usage.trips_created = 3
        usage.chatbot_messages = 10
        usage.save()
        
        self.assertFalse(usage.can_create_trip())  # 3 >= 3 limit
        self.assertFalse(usage.can_use_chatbot())  # 10 >= 10 limit

    def test_subscription_usage_reset(self):
        """Test usage reset functionality"""
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.premium_plan,
            status='active'
        )
        
        usage = SubscriptionUsage.objects.create(
            subscription=subscription,
            trips_created=5,
            chatbot_messages=20,
            api_calls_today=100
        )
        
        usage.reset_usage()
        
        self.assertEqual(usage.trips_created, 0)
        self.assertEqual(usage.chatbot_messages, 0)
        self.assertEqual(usage.api_calls_today, 0)


class PaymentExceptionTestCase(TestCase):
    """Test payment exception handling"""

    def test_payment_error_creation(self):
        """Test PaymentError exception creation"""
        error = PaymentError("Test error", "TEST_CODE")
        self.assertEqual(str(error), "Test error")
        self.assertEqual(error.error_code, "TEST_CODE")

    def test_subscription_error_creation(self):
        """Test SubscriptionError exception creation"""
        error = SubscriptionError("Subscription error", "SUB_ERROR")
        self.assertEqual(str(error), "Subscription error")
        self.assertEqual(error.error_code, "SUB_ERROR")

    def test_invalid_plan_error(self):
        """Test InvalidPlanError exception"""
        error = InvalidPlanError("Invalid plan", "INVALID_PLAN")
        self.assertIsInstance(error, SubscriptionError)
        self.assertEqual(error.error_code, "INVALID_PLAN")


class SubscriptionModelTestCase(TestCase):
    """Test subscription model functionality"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.plan = SubscriptionPlan.objects.create(
            name='monthly',
            price=Decimal('9.99'),
            duration_days=30,
            stripe_price_id='price_test'
        )

    def test_subscription_plan_str(self):
        """Test SubscriptionPlan string representation"""
        expected = "Monthly Premium - $9.99"
        self.assertEqual(str(self.plan), expected)

    def test_user_subscription_is_premium(self):
        """Test premium subscription detection"""
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            status='active'
        )
        
        self.assertTrue(subscription.is_premium)

    def test_subscription_usage_premium_limits(self):
        """Test premium subscription has unlimited usage"""
        subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            status='active'
        )
        
        usage = SubscriptionUsage.objects.create(
            subscription=subscription,
            trips_created=100,
            chatbot_messages=1000
        )
        
        # Premium users should have unlimited access
        self.assertTrue(usage.can_create_trip())
        self.assertTrue(usage.can_use_chatbot())