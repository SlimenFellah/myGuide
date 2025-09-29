"""
Enhanced security logging for subscription system
"""
import logging
from django.utils import timezone
from django.contrib.auth import get_user_model
import json

User = get_user_model()

# Configure security logger
security_logger = logging.getLogger('security')


class SecurityLogger:
    """Enhanced security logging for subscription system"""
    
    @staticmethod
    def log_payment_attempt(user, action, **kwargs):
        """
        Log payment-related security events
        
        Args:
            user: User instance or user ID
            action: Action being performed
            **kwargs: Additional context data
        """
        user_id = user.id if hasattr(user, 'id') else user
        
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'user_id': user_id,
            'action': action,
            'ip_address': kwargs.get('ip_address'),
            'user_agent': kwargs.get('user_agent'),
            'session_id': kwargs.get('session_id'),
            'plan_id': kwargs.get('plan_id'),
            'amount': kwargs.get('amount'),
            'currency': kwargs.get('currency'),
            'status': kwargs.get('status', 'attempted')
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        security_logger.info(f"PAYMENT_EVENT: {json.dumps(log_data)}")
    
    @staticmethod
    def log_subscription_change(user, action, old_plan=None, new_plan=None, **kwargs):
        """
        Log subscription changes
        
        Args:
            user: User instance
            action: Action performed (upgrade, downgrade, cancel, etc.)
            old_plan: Previous subscription plan
            new_plan: New subscription plan
            **kwargs: Additional context
        """
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'user_id': user.id,
            'username': user.username,
            'action': action,
            'old_plan': old_plan.name if old_plan else None,
            'new_plan': new_plan.name if new_plan else None,
            'ip_address': kwargs.get('ip_address'),
            'user_agent': kwargs.get('user_agent')
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        security_logger.info(f"SUBSCRIPTION_CHANGE: {json.dumps(log_data)}")
    
    @staticmethod
    def log_webhook_event(event_type, event_id, status, **kwargs):
        """
        Log webhook events for security monitoring
        
        Args:
            event_type: Stripe event type
            event_id: Stripe event ID
            status: Processing status (received, processed, failed, etc.)
            **kwargs: Additional context
        """
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'event_type': event_type,
            'event_id': event_id,
            'status': status,
            'ip_address': kwargs.get('ip_address'),
            'error': kwargs.get('error'),
            'processing_time': kwargs.get('processing_time')
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        if status == 'failed':
            security_logger.error(f"WEBHOOK_EVENT: {json.dumps(log_data)}")
        else:
            security_logger.info(f"WEBHOOK_EVENT: {json.dumps(log_data)}")
    
    @staticmethod
    def log_security_violation(violation_type, user=None, **kwargs):
        """
        Log security violations and suspicious activities
        
        Args:
            violation_type: Type of security violation
            user: User involved (if any)
            **kwargs: Additional context
        """
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'violation_type': violation_type,
            'user_id': user.id if user else None,
            'username': user.username if user else None,
            'ip_address': kwargs.get('ip_address'),
            'user_agent': kwargs.get('user_agent'),
            'details': kwargs.get('details'),
            'severity': kwargs.get('severity', 'medium')
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        security_logger.warning(f"SECURITY_VIOLATION: {json.dumps(log_data)}")
    
    @staticmethod
    def log_rate_limit_exceeded(endpoint, user=None, **kwargs):
        """
        Log rate limit violations
        
        Args:
            endpoint: Endpoint where rate limit was exceeded
            user: User who exceeded the limit (if authenticated)
            **kwargs: Additional context
        """
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'violation_type': 'rate_limit_exceeded',
            'endpoint': endpoint,
            'user_id': user.id if user else None,
            'ip_address': kwargs.get('ip_address'),
            'user_agent': kwargs.get('user_agent'),
            'requests_count': kwargs.get('requests_count'),
            'time_window': kwargs.get('time_window')
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        security_logger.warning(f"RATE_LIMIT_EXCEEDED: {json.dumps(log_data)}")
    
    @staticmethod
    def log_authentication_event(event_type, user=None, **kwargs):
        """
        Log authentication-related events
        
        Args:
            event_type: Type of authentication event
            user: User involved
            **kwargs: Additional context
        """
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'event_type': event_type,
            'user_id': user.id if user else None,
            'username': user.username if user else None,
            'ip_address': kwargs.get('ip_address'),
            'user_agent': kwargs.get('user_agent'),
            'success': kwargs.get('success', True)
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        if not kwargs.get('success', True):
            security_logger.warning(f"AUTH_EVENT: {json.dumps(log_data)}")
        else:
            security_logger.info(f"AUTH_EVENT: {json.dumps(log_data)}")
    
    @staticmethod
    def log_data_access(user, resource_type, resource_id, action, **kwargs):
        """
        Log data access events for audit trail
        
        Args:
            user: User accessing the data
            resource_type: Type of resource being accessed
            resource_id: ID of the resource
            action: Action performed (read, write, delete, etc.)
            **kwargs: Additional context
        """
        log_data = {
            'timestamp': timezone.now().isoformat(),
            'user_id': user.id,
            'username': user.username,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'action': action,
            'ip_address': kwargs.get('ip_address'),
            'user_agent': kwargs.get('user_agent'),
            'success': kwargs.get('success', True)
        }
        
        # Remove None values
        log_data = {k: v for k, v in log_data.items() if v is not None}
        
        security_logger.info(f"DATA_ACCESS: {json.dumps(log_data)}")


def get_client_info(request):
    """
    Extract client information from request for logging
    
    Args:
        request: Django request object
        
    Returns:
        dict: Client information
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0].strip()
    else:
        ip_address = request.META.get('REMOTE_ADDR')
    
    return {
        'ip_address': ip_address,
        'user_agent': request.META.get('HTTP_USER_AGENT', '')
    }