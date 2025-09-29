"""
Tests for custom exception handling and logging
"""
import json
from unittest.mock import patch, Mock
from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from ..exceptions import (
    PaymentError,
    PaymentIntentCreationError,
    PaymentConfirmationError,
    SubscriptionError,
    SubscriptionNotFoundError,
    SubscriptionUpdateError,
    StripeWebhookError,
    WebhookSignatureError,
    WebhookProcessingError,
    custom_exception_handler,
    log_payment_attempt,
    log_payment_success,
    log_payment_failure,
    log_webhook_event
)
from ..models import SubscriptionPlan, UserSubscription

User = get_user_model()


class CustomExceptionTestCase(TestCase):
    """Test custom exception classes"""

    def test_payment_error_base_class(self):
        """Test PaymentError base exception"""
        error = PaymentError("Payment failed", error_code="PAYMENT_FAILED")
        self.assertEqual(str(error), "Payment failed")
        self.assertEqual(error.error_code, "PAYMENT_FAILED")
        self.assertIsNone(error.details)

    def test_payment_error_with_details(self):
        """Test PaymentError with details"""
        details = {"amount": 1000, "currency": "usd"}
        error = PaymentError("Payment failed", error_code="PAYMENT_FAILED", details=details)
        self.assertEqual(error.details, details)

    def test_payment_intent_creation_error(self):
        """Test PaymentIntentCreationError"""
        error = PaymentIntentCreationError("Failed to create payment intent")
        self.assertEqual(error.error_code, "PAYMENT_INTENT_CREATION_FAILED")
        self.assertIn("Failed to create payment intent", str(error))

    def test_payment_confirmation_error(self):
        """Test PaymentConfirmationError"""
        error = PaymentConfirmationError("Payment confirmation failed")
        self.assertEqual(error.error_code, "PAYMENT_CONFIRMATION_FAILED")

    def test_subscription_error_base_class(self):
        """Test SubscriptionError base exception"""
        error = SubscriptionError("Subscription error", error_code="SUBSCRIPTION_ERROR")
        self.assertEqual(str(error), "Subscription error")
        self.assertEqual(error.error_code, "SUBSCRIPTION_ERROR")

    def test_subscription_not_found_error(self):
        """Test SubscriptionNotFoundError"""
        error = SubscriptionNotFoundError("Subscription not found")
        self.assertEqual(error.error_code, "SUBSCRIPTION_NOT_FOUND")

    def test_subscription_update_error(self):
        """Test SubscriptionUpdateError"""
        error = SubscriptionUpdateError("Failed to update subscription")
        self.assertEqual(error.error_code, "SUBSCRIPTION_UPDATE_FAILED")

    def test_stripe_webhook_error_base_class(self):
        """Test StripeWebhookError base exception"""
        error = StripeWebhookError("Webhook error", error_code="WEBHOOK_ERROR")
        self.assertEqual(str(error), "Webhook error")
        self.assertEqual(error.error_code, "WEBHOOK_ERROR")

    def test_webhook_signature_error(self):
        """Test WebhookSignatureError"""
        error = WebhookSignatureError("Invalid webhook signature")
        self.assertEqual(error.error_code, "WEBHOOK_SIGNATURE_INVALID")

    def test_webhook_processing_error(self):
        """Test WebhookProcessingError"""
        error = WebhookProcessingError("Failed to process webhook")
        self.assertEqual(error.error_code, "WEBHOOK_PROCESSING_FAILED")


class CustomExceptionHandlerTestCase(APITestCase):
    """Test custom exception handler"""

    def setUp(self):
        self.factory = RequestFactory()

    def test_payment_error_handling(self):
        """Test handling of PaymentError"""
        error = PaymentError("Payment failed", error_code="PAYMENT_FAILED")
        request = self.factory.post('/test/')
        
        response = custom_exception_handler(error, {'request': request})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'PAYMENT_FAILED')
        self.assertEqual(response.data['message'], 'Payment failed')

    def test_payment_error_with_details(self):
        """Test handling of PaymentError with details"""
        details = {"amount": 1000, "currency": "usd"}
        error = PaymentError("Payment failed", error_code="PAYMENT_FAILED", details=details)
        request = self.factory.post('/test/')
        
        response = custom_exception_handler(error, {'request': request})
        
        self.assertEqual(response.data['details'], details)

    def test_subscription_error_handling(self):
        """Test handling of SubscriptionError"""
        error = SubscriptionError("Subscription error", error_code="SUBSCRIPTION_ERROR")
        request = self.factory.post('/test/')
        
        response = custom_exception_handler(error, {'request': request})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'SUBSCRIPTION_ERROR')

    def test_stripe_webhook_error_handling(self):
        """Test handling of StripeWebhookError"""
        error = StripeWebhookError("Webhook error", error_code="WEBHOOK_ERROR")
        request = self.factory.post('/test/')
        
        response = custom_exception_handler(error, {'request': request})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'WEBHOOK_ERROR')

    def test_non_custom_exception_fallback(self):
        """Test fallback to default handler for non-custom exceptions"""
        error = ValueError("Standard error")
        request = self.factory.post('/test/')
        
        # Should return None to fall back to default handler
        response = custom_exception_handler(error, {'request': request})
        self.assertIsNone(response)

    def test_exception_without_error_code(self):
        """Test handling of custom exception without error_code attribute"""
        class CustomError(Exception):
            pass
        
        error = CustomError("Custom error")
        request = self.factory.post('/test/')
        
        # Should return None to fall back to default handler
        response = custom_exception_handler(error, {'request': request})
        self.assertIsNone(response)


class LoggingFunctionTestCase(TestCase):
    """Test logging functions"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    @patch('subscriptions.exceptions.logger')
    def test_log_payment_attempt(self, mock_logger):
        """Test payment attempt logging"""
        log_payment_attempt(self.user.id, "pi_test123", Decimal('9.99'))
        
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("Payment attempt", call_args)
        self.assertIn(str(self.user.id), call_args)
        self.assertIn("pi_test123", call_args)
        self.assertIn("9.99", call_args)

    @patch('subscriptions.exceptions.logger')
    def test_log_payment_success(self, mock_logger):
        """Test payment success logging"""
        log_payment_success(self.user.id, "pi_test123", Decimal('9.99'))
        
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("Payment successful", call_args)
        self.assertIn(str(self.user.id), call_args)
        self.assertIn("pi_test123", call_args)

    @patch('subscriptions.exceptions.logger')
    def test_log_payment_failure(self, mock_logger):
        """Test payment failure logging"""
        log_payment_failure(self.user.id, "pi_test123", "Card declined")
        
        mock_logger.error.assert_called_once()
        call_args = mock_logger.error.call_args[0][0]
        self.assertIn("Payment failed", call_args)
        self.assertIn(str(self.user.id), call_args)
        self.assertIn("pi_test123", call_args)
        self.assertIn("Card declined", call_args)

    @patch('subscriptions.exceptions.logger')
    def test_log_webhook_event(self, mock_logger):
        """Test webhook event logging"""
        event_data = {
            'id': 'evt_test123',
            'type': 'payment_intent.succeeded',
            'data': {'object': {'id': 'pi_test123'}}
        }
        
        log_webhook_event("payment_intent.succeeded", event_data)
        
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("Webhook event received", call_args)
        self.assertIn("payment_intent.succeeded", call_args)
        self.assertIn("evt_test123", call_args)

    @patch('subscriptions.exceptions.logger')
    def test_log_payment_attempt_with_none_values(self, mock_logger):
        """Test payment attempt logging with None values"""
        log_payment_attempt(None, None, None)
        
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("Payment attempt", call_args)
        self.assertIn("None", call_args)

    @patch('subscriptions.exceptions.logger')
    def test_log_webhook_event_with_minimal_data(self, mock_logger):
        """Test webhook event logging with minimal data"""
        event_data = {'id': 'evt_test123'}
        
        log_webhook_event("test.event", event_data)
        
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args[0][0]
        self.assertIn("test.event", call_args)
        self.assertIn("evt_test123", call_args)


class ExceptionIntegrationTestCase(APITestCase):
    """Integration tests for exception handling in views"""

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

    def test_create_checkout_session_missing_plan_id(self):
        """Test CreateCheckoutSessionView with missing plan_id"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/subscriptions/create-checkout-session/', {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'PAYMENT_INTENT_CREATION_FAILED')

    def test_create_checkout_session_invalid_plan_id(self):
        """Test CreateCheckoutSessionView with invalid plan_id"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/subscriptions/create-checkout-session/', {
            'plan_id': 99999
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'SUBSCRIPTION_NOT_FOUND')

    @patch('stripe.checkout.Session.create')
    def test_create_checkout_session_stripe_error(self, mock_create):
        """Test CreateCheckoutSessionView with Stripe error"""
        import stripe
        mock_create.side_effect = stripe.error.StripeError("Stripe error")
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/subscriptions/create-checkout-session/', {
            'plan_id': self.plan.id
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'PAYMENT_INTENT_CREATION_FAILED')

    def test_verify_checkout_session_missing_session_id(self):
        """Test verify_checkout_session with missing session_id"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/subscriptions/verify-checkout-session/', {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'PAYMENT_CONFIRMATION_FAILED')

    @patch('stripe.checkout.Session.retrieve')
    def test_verify_checkout_session_stripe_error(self, mock_retrieve):
        """Test verify_checkout_session with Stripe error"""
        import stripe
        mock_retrieve.side_effect = stripe.error.StripeError("Session not found")
        
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/subscriptions/verify-checkout-session/', {
            'session_id': 'cs_test123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'PAYMENT_CONFIRMATION_FAILED')