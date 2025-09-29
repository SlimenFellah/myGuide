"""
Custom exceptions for subscription and payment handling
"""
from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


class PaymentError(Exception):
    """Base exception for payment-related errors"""
    def __init__(self, message, error_code=None, stripe_error=None):
        self.message = message
        self.error_code = error_code
        self.stripe_error = stripe_error
        super().__init__(self.message)


class SubscriptionError(Exception):
    """Base exception for subscription-related errors"""
    def __init__(self, message, error_code=None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class StripeWebhookError(Exception):
    """Exception for Stripe webhook processing errors"""
    def __init__(self, message, event_type=None, event_id=None):
        self.message = message
        self.event_type = event_type
        self.event_id = event_id
        super().__init__(self.message)


class InsufficientPermissionsError(SubscriptionError):
    """Raised when user doesn't have required subscription permissions"""
    pass


class InvalidPlanError(SubscriptionError):
    """Raised when trying to use an invalid subscription plan"""
    pass


class PaymentProcessingError(PaymentError):
    """Raised when payment processing fails"""
    pass


class WebhookVerificationError(StripeWebhookError):
    """Raised when webhook signature verification fails"""
    pass


def custom_exception_handler(exc, context):
    """Custom exception handler for payment and subscription errors"""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle custom exceptions
    if isinstance(exc, PaymentError):
        logger.error(f"Payment error: {exc.message}", extra={
            'error_code': exc.error_code,
            'stripe_error': str(exc.stripe_error) if exc.stripe_error else None,
            'view': context.get('view').__class__.__name__ if context.get('view') else None,
            'request_data': getattr(context.get('request'), 'data', None)
        })
        
        return Response({
            'error': exc.message,
            'error_code': exc.error_code,
            'type': 'payment_error'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif isinstance(exc, SubscriptionError):
        logger.error(f"Subscription error: {exc.message}", extra={
            'error_code': exc.error_code,
            'view': context.get('view').__class__.__name__ if context.get('view') else None,
            'user': getattr(context.get('request'), 'user', None)
        })
        
        return Response({
            'error': exc.message,
            'error_code': exc.error_code,
            'type': 'subscription_error'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif isinstance(exc, StripeWebhookError):
        logger.error(f"Webhook error: {exc.message}", extra={
            'event_type': exc.event_type,
            'event_id': exc.event_id,
            'view': context.get('view').__class__.__name__ if context.get('view') else None
        })
        
        return Response({
            'error': 'Webhook processing failed',
            'type': 'webhook_error'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Return the default response for other exceptions
    return response


def log_payment_attempt(user, action, plan=None, amount=None, **kwargs):
    """Log payment attempts for audit trail"""
    logger.info(f"Payment attempt: {action}", extra={
        'user_id': user.id if user else None,
        'username': user.username if user else None,
        'action': action,
        'plan': plan.name if plan else None,
        'amount': str(amount) if amount else None,
        **kwargs
    })


def log_payment_success(user, action, transaction_id=None, **kwargs):
    """Log successful payment operations"""
    logger.info(f"Payment success: {action}", extra={
        'user_id': user.id if user else None,
        'username': user.username if user else None,
        'action': action,
        'transaction_id': transaction_id,
        **kwargs
    })


def log_payment_failure(user, action, error_message, **kwargs):
    """Log failed payment operations"""
    logger.error(f"Payment failure: {action}", extra={
        'user_id': user.id if user else None,
        'username': user.username if user else None,
        'action': action,
        'error_message': error_message,
        **kwargs
    })


def log_webhook_event(event_type, event_id, status, **kwargs):
    """Log webhook events for monitoring"""
    logger.info(f"Webhook event: {event_type}", extra={
        'event_type': event_type,
        'event_id': event_id,
        'status': status,
        **kwargs
    })