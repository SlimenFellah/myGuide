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

const SubscriptionCard = ({ plan, isCurrentPlan, onSelectPlan, loading }) => {
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
    return features || [];
  };

  const features = parseFeatures(plan.features);
  const isPopular = plan.name.toLowerCase().includes('annual');

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      {isPopular && (
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

      <CardContent sx={{ flexGrow: 1, pt: isPopular ? 3 : 2 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center" fontWeight="bold">
          {plan.name}
        </Typography>
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h3" component="div" color="primary" fontWeight="bold">
            {formatPrice(plan.price)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDuration(plan.duration_days)}
          </Typography>
        </Box>

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
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={isCurrentPlan ? "outlined" : "contained"}
          color="primary"
          size="large"
          onClick={() => onSelectPlan(plan)}
          disabled={loading || isCurrentPlan}
          sx={{ 
            py: 1.5,
            fontWeight: 'bold',
            textTransform: 'none'
          }}
        >
          {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default SubscriptionCard;