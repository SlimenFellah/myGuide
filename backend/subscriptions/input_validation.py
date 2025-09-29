"""
Input validation and sanitization utilities for subscription system
"""
import re
import bleach
from decimal import Decimal, InvalidOperation
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)


class InputValidator:
    """Utility class for input validation and sanitization"""
    
    @staticmethod
    def sanitize_string(value, max_length=255):
        """
        Sanitize string input by removing HTML tags and limiting length
        
        Args:
            value: Input string to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string
        """
        if not isinstance(value, str):
            return str(value)
        
        # Remove HTML tags and strip whitespace
        sanitized = strip_tags(value).strip()
        
        # Limit length
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized
    
    @staticmethod
    def validate_email(email):
        """
        Validate email format
        
        Args:
            email: Email string to validate
            
        Returns:
            bool: True if valid email format
        """
        if not email or not isinstance(email, str):
            return False
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(email_pattern, email.strip()) is not None
    
    @staticmethod
    def validate_stripe_session_id(session_id):
        """
        Validate Stripe session ID format
        
        Args:
            session_id: Stripe session ID to validate
            
        Returns:
            bool: True if valid session ID format
        """
        if not session_id or not isinstance(session_id, str):
            return False
        
        # Stripe session IDs start with 'cs_' followed by alphanumeric characters
        session_pattern = r'^cs_(test_|live_)?[a-zA-Z0-9]+$'
        return re.match(session_pattern, session_id.strip()) is not None
    
    @staticmethod
    def validate_stripe_customer_id(customer_id):
        """
        Validate Stripe customer ID format
        
        Args:
            customer_id: Stripe customer ID to validate
            
        Returns:
            bool: True if valid customer ID format
        """
        if not customer_id or not isinstance(customer_id, str):
            return False
        
        # Stripe customer IDs start with 'cus_' followed by alphanumeric characters
        customer_pattern = r'^cus_[a-zA-Z0-9]+$'
        return re.match(customer_pattern, customer_id.strip()) is not None
    
    @staticmethod
    def validate_price(price):
        """
        Validate price value
        
        Args:
            price: Price value to validate
            
        Returns:
            Decimal: Validated price as Decimal
            
        Raises:
            ValidationError: If price is invalid
        """
        try:
            decimal_price = Decimal(str(price))
            
            # Check if price is non-negative
            if decimal_price < 0:
                raise ValidationError("Price cannot be negative")
            
            # Check if price has reasonable precision (max 2 decimal places)
            if decimal_price.as_tuple().exponent < -2:
                raise ValidationError("Price cannot have more than 2 decimal places")
            
            # Check if price is within reasonable bounds (max $10,000)
            if decimal_price > Decimal('10000.00'):
                raise ValidationError("Price cannot exceed $10,000")
            
            return decimal_price
            
        except (InvalidOperation, ValueError):
            raise ValidationError("Invalid price format")
    
    @staticmethod
    def validate_plan_id(plan_id):
        """
        Validate subscription plan ID
        
        Args:
            plan_id: Plan ID to validate
            
        Returns:
            int: Validated plan ID
            
        Raises:
            ValidationError: If plan ID is invalid
        """
        try:
            plan_id_int = int(plan_id)
            
            if plan_id_int <= 0:
                raise ValidationError("Plan ID must be positive")
            
            return plan_id_int
            
        except (ValueError, TypeError):
            raise ValidationError("Invalid plan ID format")
    
    @staticmethod
    def sanitize_metadata(metadata):
        """
        Sanitize metadata dictionary
        
        Args:
            metadata: Dictionary to sanitize
            
        Returns:
            dict: Sanitized metadata
        """
        if not isinstance(metadata, dict):
            return {}
        
        sanitized = {}
        for key, value in metadata.items():
            # Sanitize key and value
            clean_key = InputValidator.sanitize_string(str(key), max_length=50)
            clean_value = InputValidator.sanitize_string(str(value), max_length=500)
            
            # Only include non-empty keys and values
            if clean_key and clean_value:
                sanitized[clean_key] = clean_value
        
        return sanitized
    
    @staticmethod
    def validate_user_id(user_id):
        """
        Validate user ID
        
        Args:
            user_id: User ID to validate
            
        Returns:
            int: Validated user ID
            
        Raises:
            ValidationError: If user ID is invalid
        """
        try:
            user_id_int = int(user_id)
            
            if user_id_int <= 0:
                raise ValidationError("User ID must be positive")
            
            return user_id_int
            
        except (ValueError, TypeError):
            raise ValidationError("Invalid user ID format")


def validate_subscription_request(data):
    """
    Validate subscription request data
    
    Args:
        data: Request data dictionary
        
    Returns:
        dict: Validated and sanitized data
        
    Raises:
        ValidationError: If validation fails
    """
    validator = InputValidator()
    validated_data = {}
    
    # Validate plan_id
    if 'plan_id' in data:
        validated_data['plan_id'] = validator.validate_plan_id(data['plan_id'])
    
    # Validate session_id if present
    if 'session_id' in data:
        session_id = validator.sanitize_string(data['session_id'], max_length=100)
        if not validator.validate_stripe_session_id(session_id):
            raise ValidationError("Invalid Stripe session ID format")
        validated_data['session_id'] = session_id
    
    # Validate metadata if present
    if 'metadata' in data:
        validated_data['metadata'] = validator.sanitize_metadata(data['metadata'])
    
    return validated_data


def validate_webhook_data(data):
    """
    Validate webhook data
    
    Args:
        data: Webhook data dictionary
        
    Returns:
        dict: Validated data
        
    Raises:
        ValidationError: If validation fails
    """
    validator = InputValidator()
    validated_data = {}
    
    # Validate customer ID if present
    if 'customer' in data:
        customer_id = validator.sanitize_string(data['customer'], max_length=100)
        if not validator.validate_stripe_customer_id(customer_id):
            raise ValidationError("Invalid Stripe customer ID format")
        validated_data['customer'] = customer_id
    
    # Validate subscription ID if present
    if 'id' in data:
        subscription_id = validator.sanitize_string(data['id'], max_length=100)
        validated_data['id'] = subscription_id
    
    return validated_data