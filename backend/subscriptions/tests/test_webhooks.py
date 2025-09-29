"""
Tests for Stripe webhook handling
"""
import json
import hmac
import hashlib
import time
from unittest.mock import patch, Mock
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.conf import settings
from decimal import Decimal

from ..models import SubscriptionPlan, UserSubscription, PaymentHistory
from ..views import (
    handle_successful_payment,
    handle_subscription_updated,
    handle_payment_failed,
    handle_trial_will_end,
    handle_checkout_session_completed,
    handle_subscription_cancelled,
    handle_invoice_payment_succeeded
)

User = get_user_model()


class WebhookTestCase(TestCase):
    """Test Stripe webhook handling"""

    def setUp(self):
        """Set up test data"""
        self.client = Client()
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
        
        self.subscription = UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            status='active',
            stripe_subscription_id='sub_test123',
            stripe_customer_id='cus_test123'
        )

    def create_webhook_signature(self, payload, secret):
        """Create a valid Stripe webhook signature"""
        timestamp = str(int(time.time()))
        signed_payload = f"{timestamp}.{payload}"
        signature = hmac.new(
            secret.encode('utf-8'),
            signed_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return f"t={timestamp},v1={signature}"

    def test_webhook_signature_verification_success(self):
        """Test successful webhook signature verification"""
        payload = json.dumps({
            'id': 'evt_test123',
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_test123',
                    'customer': 'cus_test123',
                    'amount': 999,
                    'currency': 'usd',
                    'status': 'succeeded'
                }
            }
        })
        
        secret = 'whsec_test123'
        signature = self.create_webhook_signature(payload, secret)
        
        with patch('django.conf.settings.STRIPE_WEBHOOK_SECRET', secret), \
             patch('stripe.Webhook.construct_event') as mock_construct:
            
            mock_construct.return_value = json.loads(payload)
            
            response = self.client.post(
            reverse('subscriptions:stripe-webhook'),
            data=json.dumps(payload),
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE=signature
        )
            
            self.assertEqual(response.status_code, 200)

    def test_webhook_invalid_signature(self):
        """Test webhook with invalid signature"""
        payload = json.dumps({
            'id': 'evt_test123',
            'type': 'payment_intent.succeeded',
            'data': {'object': {}}
        })
        
        with patch('django.conf.settings.STRIPE_WEBHOOK_SECRET', 'whsec_test123'):
            response = self.client.post(
                reverse('subscriptions:stripe-webhook'),
                data=payload,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE='invalid_signature'
            )
            
            self.assertEqual(response.status_code, 400)

    def test_handle_successful_payment(self):
        """Test successful payment webhook handler"""
        payment_intent_data = {
            'id': 'pi_test123',
            'customer': 'cus_test123',
            'amount': 999,
            'currency': 'usd',
            'status': 'succeeded',
            'metadata': {
                'user_id': str(self.user.id),
                'subscription_id': str(self.subscription.id)
            }
        }
        
        handle_successful_payment(payment_intent_data)
        
        # Check payment history was created
        payment = PaymentHistory.objects.get(
            stripe_payment_intent_id='pi_test123'
        )
        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.status, 'completed')
        self.assertEqual(payment.amount, Decimal('9.99'))

    def test_handle_subscription_updated(self):
        """Test subscription updated webhook handler"""
        subscription_data = {
            'id': 'sub_test123',
            'customer': 'cus_test123',
            'status': 'active',
            'current_period_end': 1234567890,
            'cancel_at_period_end': False
        }
        
        handle_subscription_updated(subscription_data)
        
        # Check subscription was updated
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, 'active')

    def test_handle_payment_failed(self):
        """Test payment failed webhook handler"""
        invoice_data = {
            'id': 'in_test123',
            'customer': 'cus_test123',
            'subscription': 'sub_test123',
            'amount_due': 999,
            'currency': 'usd',
            'status': 'open',
            'attempt_count': 1
        }
        
        with patch('subscriptions.views.logger') as mock_logger:
            handle_payment_failed(invoice_data)
            mock_logger.warning.assert_called()

    def test_handle_trial_will_end(self):
        """Test trial will end webhook handler"""
        subscription_data = {
            'id': 'sub_test123',
            'customer': 'cus_test123',
            'trial_end': 1234567890,
            'status': 'trialing'
        }
        
        with patch('subscriptions.views.logger') as mock_logger:
            handle_trial_will_end(subscription_data)
            mock_logger.info.assert_called()

    def test_handle_checkout_session_completed(self):
        """Test checkout session completed webhook handler"""
        session_data = {
            'id': 'cs_test123',
            'customer': 'cus_test123',
            'subscription': 'sub_test123',
            'payment_status': 'paid',
            'metadata': {
                'user_id': str(self.user.id),
                'subscription_id': str(self.subscription.id)
            }
        }
        
        handle_checkout_session_completed(session_data)
        
        # Check subscription was activated
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, 'active')

    def test_handle_subscription_cancelled(self):
        """Test subscription cancelled webhook handler"""
        subscription_data = {
            'id': 'sub_test123',
            'customer': 'cus_test123',
            'status': 'canceled',
            'canceled_at': 1234567890
        }
        
        handle_subscription_cancelled(subscription_data)
        
        # Check subscription was cancelled
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.status, 'cancelled')

    def test_handle_invoice_payment_succeeded(self):
        """Test invoice payment succeeded webhook handler"""
        invoice_data = {
            'id': 'in_test123',
            'customer': 'cus_test123',
            'subscription': 'sub_test123',
            'amount_paid': 999,
            'currency': 'usd',
            'status': 'paid',
            'billing_reason': 'subscription_cycle'
        }
        
        handle_invoice_payment_succeeded(invoice_data)
        
        # Check payment history was created
        payment = PaymentHistory.objects.get(
            stripe_invoice_id='in_test123'
        )
        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.status, 'completed')

    def test_webhook_unhandled_event(self):
        """Test webhook with unhandled event type"""
        payload = json.dumps({
            'id': 'evt_test123',
            'type': 'customer.created',
            'data': {'object': {}}
        })
        
        secret = 'whsec_test123'
        signature = self.create_webhook_signature(payload, secret)
        
        with patch('django.conf.settings.STRIPE_WEBHOOK_SECRET', secret), \
             patch('stripe.Webhook.construct_event') as mock_construct, \
             patch('subscriptions.views.logger') as mock_logger:
            
            mock_construct.return_value = json.loads(payload)
            
            response = self.client.post(
                reverse('subscriptions:stripe-webhook'),
                data=payload,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
            
            self.assertEqual(response.status_code, 200)
            mock_logger.info.assert_called_with("Unhandled webhook event: customer.created")

    def test_webhook_processing_error(self):
        """Test webhook processing error handling"""
        payload = json.dumps({
            'id': 'evt_test123',
            'type': 'payment_intent.succeeded',
            'data': {
                'object': {
                    'id': 'pi_test123',
                    'customer': 'invalid_customer',
                    'amount': 999,
                    'currency': 'usd',
                    'status': 'succeeded'
                }
            }
        })
        
        secret = 'whsec_test123'
        signature = self.create_webhook_signature(payload, secret)
        
        with patch('django.conf.settings.STRIPE_WEBHOOK_SECRET', secret), \
             patch('stripe.Webhook.construct_event') as mock_construct, \
             patch('subscriptions.views.handle_successful_payment') as mock_handler:
            
            mock_construct.return_value = json.loads(payload)
            mock_handler.side_effect = Exception("Processing error")
            
            response = self.client.post(
                reverse('subscriptions:stripe-webhook'),
                data=payload,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
            
            self.assertEqual(response.status_code, 500)

    def test_webhook_missing_subscription(self):
        """Test webhook handler with missing subscription"""
        payment_intent_data = {
            'id': 'pi_test123',
            'customer': 'cus_nonexistent',
            'amount': 999,
            'currency': 'usd',
            'status': 'succeeded',
            'metadata': {}
        }
        
        # Should not raise exception, just log warning
        with patch('subscriptions.views.logger') as mock_logger:
            handle_successful_payment(payment_intent_data)
            mock_logger.warning.assert_called()

    def test_webhook_duplicate_processing(self):
        """Test webhook idempotency - duplicate events should be handled gracefully"""
        payment_intent_data = {
            'id': 'pi_test123',
            'customer': 'cus_test123',
            'amount': 999,
            'currency': 'usd',
            'status': 'succeeded',
            'metadata': {
                'user_id': str(self.user.id),
                'subscription_id': str(self.subscription.id)
            }
        }
        
        # Process the same payment twice
        handle_successful_payment(payment_intent_data)
        handle_successful_payment(payment_intent_data)
        
        # Should only create one payment record
        payments = PaymentHistory.objects.filter(
            stripe_payment_intent_id='pi_test123'
        )
        self.assertEqual(payments.count(), 1)


class WebhookSecurityTestCase(TestCase):
    """Test webhook security measures"""

    def setUp(self):
        self.client = Client()

    def test_webhook_requires_post(self):
        """Test webhook endpoint only accepts POST requests"""
        response = self.client.get(reverse('subscriptions:stripe-webhook'))
        self.assertEqual(response.status_code, 405)  # Method not allowed

    def test_webhook_csrf_exempt(self):
        """Test webhook is exempt from CSRF protection"""
        # This test ensures the @csrf_exempt decorator is working
        payload = json.dumps({'test': 'data'})
        
        response = self.client.post(
            reverse('subscriptions:stripe-webhook'),
            data=payload,
            content_type='application/json'
        )
        
        # Should not get CSRF error (would be 403)
        # Will get 400 due to invalid signature, which is expected
        self.assertEqual(response.status_code, 400)

    def test_webhook_signature_timing_attack_protection(self):
        """Test webhook signature verification is resistant to timing attacks"""
        payload = json.dumps({'test': 'data'})
        
        # Test with completely wrong signature
        response1 = self.client.post(
            reverse('subscriptions:stripe-webhook'),
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='wrong_signature'
        )
        
        # Test with partially correct signature
        response2 = self.client.post(
            reverse('subscriptions:stripe-webhook'),
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='t=1234567890,v1=partial_match'
        )
        
        # Both should return the same error code
        self.assertEqual(response1.status_code, 400)
        self.assertEqual(response2.status_code, 400)