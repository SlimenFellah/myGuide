"""
Rate limiting decorators for subscription endpoints
"""
import time
from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""
    pass


def rate_limit(max_requests=10, window_seconds=60, key_func=None):
    """
    Rate limiting decorator for subscription endpoints
    
    Args:
        max_requests: Maximum number of requests allowed in the time window
        window_seconds: Time window in seconds
        key_func: Function to generate cache key (defaults to IP-based)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(request)
            else:
                # Default to IP-based rate limiting
                ip_address = get_client_ip(request)
                cache_key = f"rate_limit:{view_func.__name__}:{ip_address}"
            
            # Get current request count
            current_requests = cache.get(cache_key, 0)
            
            if current_requests >= max_requests:
                logger.warning(f"Rate limit exceeded for {cache_key}")
                return JsonResponse({
                    'error': 'Rate limit exceeded. Please try again later.',
                    'retry_after': window_seconds
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Increment request count
            cache.set(cache_key, current_requests + 1, window_seconds)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def subscription_rate_limit(request):
    """Generate cache key for subscription-related endpoints"""
    user_id = getattr(request.user, 'id', 'anonymous')
    ip_address = get_client_ip(request)
    return f"subscription_rate_limit:{user_id}:{ip_address}"


def payment_rate_limit(request):
    """Generate cache key for payment-related endpoints"""
    user_id = getattr(request.user, 'id', 'anonymous')
    ip_address = get_client_ip(request)
    return f"payment_rate_limit:{user_id}:{ip_address}"


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# Specific rate limiting decorators for different endpoints
def subscription_endpoint_rate_limit(view_func):
    """Rate limit for general subscription endpoints (20 requests per minute)"""
    return rate_limit(
        max_requests=20,
        window_seconds=60,
        key_func=subscription_rate_limit
    )(view_func)


def payment_endpoint_rate_limit(view_func):
    """Rate limit for payment endpoints (5 requests per minute)"""
    return rate_limit(
        max_requests=5,
        window_seconds=60,
        key_func=payment_rate_limit
    )(view_func)


def webhook_rate_limit(view_func):
    """Rate limit for webhook endpoints (100 requests per minute)"""
    return rate_limit(
        max_requests=100,
        window_seconds=60,
        key_func=lambda request: f"webhook_rate_limit:{get_client_ip(request)}"
    )(view_func)