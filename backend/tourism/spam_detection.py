# Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev

import re
from typing import Tuple
from django.utils import timezone

class SpamDetectionService:
    """
    AI-powered spam detection service for feedback comments.
    Uses text analysis and pattern matching to identify spam content.
    """
    
    # Common spam indicators
    SPAM_KEYWORDS = [
        # Promotional spam
        'buy now', 'click here', 'free money', 'make money', 'earn cash',
        'get rich', 'work from home', 'business opportunity', 'investment',
        'loan', 'credit', 'casino', 'gambling', 'lottery', 'winner',
        
        # Adult content
        'adult', 'xxx', 'porn', 'sex', 'dating', 'hookup',
        
        # Fake reviews
        'best ever', 'amazing deal', 'must buy', 'highly recommend',
        'changed my life', 'miracle', 'unbelievable',
        
        # Suspicious patterns
        'visit my website', 'check out my', 'follow me', 'subscribe',
        'like and share', 'dm me', 'contact me',
    ]
    
    # Suspicious patterns (regex)
    SUSPICIOUS_PATTERNS = [
        r'\b\d{10,}\b',  # Long numbers (phone numbers)
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email addresses
        r'https?://[^\s]+',  # URLs
        r'www\.[^\s]+',  # Website references
        r'\$\d+',  # Money amounts
        r'\b(call|text|whatsapp)\s+\d+',  # Contact instructions
    ]
    
    @classmethod
    def detect_spam(cls, comment: str) -> Tuple[bool, float]:
        """
        Analyze a comment for spam indicators.
        
        Args:
            comment (str): The feedback comment to analyze
            
        Returns:
            Tuple[bool, float]: (is_spam, confidence_score)
        """
        if not comment or len(comment.strip()) < 3:
            return False, 0.0
            
        comment_lower = comment.lower().strip()
        spam_score = 0.0
        
        # Check for spam keywords
        keyword_matches = 0
        for keyword in cls.SPAM_KEYWORDS:
            if keyword in comment_lower:
                keyword_matches += 1
                spam_score += 0.15
        
        # Check for suspicious patterns
        pattern_matches = 0
        for pattern in cls.SUSPICIOUS_PATTERNS:
            if re.search(pattern, comment, re.IGNORECASE):
                pattern_matches += 1
                spam_score += 0.25
        
        # Additional heuristics
        
        # Too many capital letters
        if len(re.findall(r'[A-Z]', comment)) > len(comment) * 0.5:
            spam_score += 0.2
        
        # Too many exclamation marks
        exclamation_count = comment.count('!')
        if exclamation_count > 3:
            spam_score += 0.15
        
        # Repeated characters (like "aaaaamazing")
        if re.search(r'(.)\1{3,}', comment_lower):
            spam_score += 0.2
        
        # Very short comments with promotional keywords
        if len(comment_lower.split()) < 5 and keyword_matches > 0:
            spam_score += 0.3
        
        # Very long comments (potential copy-paste spam)
        if len(comment_lower.split()) > 200:
            spam_score += 0.1
        
        # Normalize spam score to 0-1 range
        spam_score = min(spam_score, 1.0)
        
        # Determine if it's spam (threshold: 0.5)
        is_spam = spam_score >= 0.5
        
        return is_spam, spam_score
    
    @classmethod
    def get_spam_reasons(cls, comment: str) -> list:
        """
        Get detailed reasons why a comment was flagged as spam.
        
        Args:
            comment (str): The feedback comment to analyze
            
        Returns:
            list: List of reasons for spam classification
        """
        reasons = []
        
        if not comment:
            return reasons
            
        comment_lower = comment.lower().strip()
        
        # Check spam keywords
        found_keywords = [kw for kw in cls.SPAM_KEYWORDS if kw in comment_lower]
        if found_keywords:
            reasons.append(f"Contains spam keywords: {', '.join(found_keywords[:3])}")
        
        # Check patterns
        if re.search(r'\b\d{10,}\b', comment):
            reasons.append("Contains phone number")
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', comment):
            reasons.append("Contains email address")
        if re.search(r'https?://[^\s]+|www\.[^\s]+', comment):
            reasons.append("Contains website URL")
        
        # Check other indicators
        if len(re.findall(r'[A-Z]', comment)) > len(comment) * 0.5:
            reasons.append("Excessive capital letters")
        if comment.count('!') > 3:
            reasons.append("Too many exclamation marks")
        if re.search(r'(.)\1{3,}', comment_lower):
            reasons.append("Repeated characters")
        
        return reasons