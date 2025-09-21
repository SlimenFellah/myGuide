"""
Token validation utilities for JWT authentication
Author: Slimene Fellah
Available for freelance projects
"""

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
import jwt
from django.conf import settings


class TokenValidator:
    """Utility class for JWT token validation and expiration checking"""
    
    @staticmethod
    def validate_token(token_string):
        """
        Validate JWT token and return validation result
        
        Args:
            token_string (str): JWT token string
            
        Returns:
            dict: Validation result with status, message, and token info
        """
        try:
            # Validate token using simplejwt
            token = AccessToken(token_string)
            
            # Get token expiration time
            exp_timestamp = token.payload.get('exp')
            if exp_timestamp:
                exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
                current_time = timezone.now()
                
                # Check if token is expired
                if exp_datetime <= current_time:
                    return {
                        'valid': False,
                        'expired': True,
                        'message': 'Token has expired',
                        'exp_time': exp_datetime
                    }
                
                # Check if token expires soon (within 5 minutes)
                time_until_expiry = exp_datetime - current_time
                expires_soon = time_until_expiry <= timedelta(minutes=5)
                
                return {
                    'valid': True,
                    'expired': False,
                    'expires_soon': expires_soon,
                    'exp_time': exp_datetime,
                    'time_until_expiry': time_until_expiry.total_seconds(),
                    'message': 'Token is valid'
                }
            
            return {
                'valid': True,
                'expired': False,
                'message': 'Token is valid but no expiration found'
            }
            
        except TokenError as e:
            return {
                'valid': False,
                'expired': True,
                'message': f'Invalid token: {str(e)}'
            }
        except Exception as e:
            return {
                'valid': False,
                'expired': False,
                'message': f'Token validation error: {str(e)}'
            }
    
    @staticmethod
    def get_token_info(token_string):
        """
        Get detailed information about a JWT token
        
        Args:
            token_string (str): JWT token string
            
        Returns:
            dict: Token information including user_id, exp, iat, etc.
        """
        try:
            # Decode token without verification to get payload info
            decoded = jwt.decode(
                token_string, 
                options={"verify_signature": False}
            )
            
            return {
                'success': True,
                'payload': decoded,
                'user_id': decoded.get('user_id'),
                'exp': decoded.get('exp'),
                'iat': decoded.get('iat'),
                'token_type': decoded.get('token_type')
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


def token_validation_response(validation_result):
    """
    Generate appropriate HTTP response based on token validation result
    
    Args:
        validation_result (dict): Result from TokenValidator.validate_token()
        
    Returns:
        Response: DRF Response object with appropriate status and message
    """
    if not validation_result['valid']:
        if validation_result.get('expired'):
            return Response(
                {
                    'error': 'Token expired',
                    'message': validation_result['message'],
                    'code': 'TOKEN_EXPIRED'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        else:
            return Response(
                {
                    'error': 'Invalid token',
                    'message': validation_result['message'],
                    'code': 'TOKEN_INVALID'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    # Token is valid
    response_data = {
        'valid': True,
        'message': validation_result['message']
    }
    
    # Add expiration warning if token expires soon
    if validation_result.get('expires_soon'):
        response_data['warning'] = 'Token expires soon'
        response_data['expires_in'] = validation_result.get('time_until_expiry', 0)
    
    return Response(response_data, status=status.HTTP_200_OK)