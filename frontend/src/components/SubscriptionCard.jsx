import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Check, Star } from '@mui/icons-material';

const SubscriptionCard = ({ plan, isCurrentPlan, onSelectPlan, loading, compact = false }) => {
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const formatDuration = (duration) => {
    if (duration === 0) return '';
    if (duration === 30) return '/month';
    if (duration === 365) return '/year';
    return `/${duration} days`;
  };

  const parseFeatures = (features) => {
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch {
        return features.split(',').map(f => f.trim());
      }
    }
    
    // Handle object format from API
    if (typeof features === 'object' && features !== null) {
      const featureList = [];
      
      // Convert object properties to readable feature descriptions
      if (features.trip_plans_per_month) {
        const trips = features.trip_plans_per_month === 'unlimited' ? 'Unlimited' : features.trip_plans_per_month;
        featureList.push(`${trips} trip plans per month`);
      }
      
      if (features.chatbot_messages_per_day) {
        const messages = features.chatbot_messages_per_day === 'unlimited' ? 'Unlimited' : features.chatbot_messages_per_day;
        featureList.push(`${messages} chatbot messages per day`);
      }
      
      if (features.api_calls_per_day) {
        const calls = features.api_calls_per_day === 'unlimited' ? 'Unlimited' : features.api_calls_per_day;
        featureList.push(`${calls} API calls per day`);
      }
      
      if (features.export_trips) {
        featureList.push('Export trips');
      }
      
      if (features.priority_support) {
        featureList.push('Priority support');
      }
      
      if (features.advanced_ai_features) {
        featureList.push('Advanced AI features');
      }
      
      if (features.custom_trip_templates) {
        featureList.push('Custom trip templates');
      }
      
      if (features.detailed_analytics) {
        featureList.push('Detailed analytics');
      }
      
      if (features.annual_discount) {
        featureList.push(`${features.annual_discount} annual discount`);
      }
      
      return featureList;
    }
    
    return Array.isArray(features) ? features : [];
  };

  const features = parseFeatures(plan.features);
  const isPopular = plan.name.toLowerCase().includes('annual');

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        position: 'relative',
        border: isCurrentPlan ? '2px solid #1976d2' : '1px solid #e0e0e0',
        boxShadow: isPopular ? '0 8px 24px rgba(25, 118, 210, 0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}
    >
      {isPopular && !compact && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
        >
          <Chip
            icon={<Star />}
            label="Most Popular"
            color="primary"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      )}

      {isCurrentPlan && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1
          }}
        >
          <Chip
            label="Current Plan"
            color="success"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      )}

      <CardContent sx={{ 
        flexGrow: 1, 
        pt: isPopular && !compact ? 3 : 2,
        display: compact ? 'flex' : 'block',
        alignItems: compact ? 'center' : 'stretch',
        gap: compact ? 2 : 0
      }}>
        <Box sx={{ flex: compact ? 1 : 'none' }}>
          <Typography 
            variant={compact ? "h6" : "h5"} 
            component="h2" 
            gutterBottom={!compact} 
            align={compact ? "left" : "center"} 
            fontWeight="bold"
          >
            {plan.name}
          </Typography>
          
          <Box sx={{ 
            textAlign: compact ? 'left' : 'center', 
            mb: compact ? 0 : 3,
            display: compact ? 'inline-block' : 'block'
          }}>
            <Typography 
              variant={compact ? "h5" : "h3"} 
              component="div" 
              color="primary" 
              fontWeight="bold"
              sx={{ display: compact ? 'inline' : 'block' }}
            >
              {formatPrice(plan.price)}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: compact ? 'inline' : 'block', ml: compact ? 0.5 : 0 }}
            >
              {formatDuration(plan.duration_days)}
            </Typography>
          </Box>
        </Box>

        {!compact && (
          <List dense>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Check color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={feature} 
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      <CardActions sx={{ 
        p: 2, 
        pt: 0,
        minWidth: compact ? 'auto' : 'unset'
      }}>
        <Button
          fullWidth={!compact}
          variant={isCurrentPlan ? "outlined" : "contained"}
          color="primary"
          size={compact ? "medium" : "large"}
          onClick={() => onSelectPlan(plan)}
          disabled={loading || isCurrentPlan}
          sx={{ 
            py: compact ? 1 : 1.5,
            fontWeight: 'bold',
            textTransform: 'none',
            minWidth: compact ? 120 : 'auto'
          }}
        >
          {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default SubscriptionCard;