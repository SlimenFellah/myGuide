/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Button, Chip, Card, CardContent, DialogActions, Typography, Box } from '@mui/material';
import { CalendarToday as Calendar } from '@mui/icons-material';
import {
  MapPin,
  Users,
  DollarSign,
  Clock,
  Star,
  X
} from 'lucide-react';

const TripDetailsModal = ({ trip, isOpen, onClose }) => {
  if (!trip) return null;

  const tripPlan = trip.trip_plan || trip;
  const dailyPlans = tripPlan.daily_plans || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {tripPlan.title || `Trip to ${tripPlan.province}`}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-semibold">{tripPlan.province}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{tripPlan.duration_days || 'Multi'} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Group Size</p>
                <p className="font-semibold">{tripPlan.group_size || 1} {tripPlan.group_size === 1 ? 'person' : 'people'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold">
                  {tripPlan.estimated_cost ? `$${tripPlan.estimated_cost}` : tripPlan.budget_range || 'Medium'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trip Type and Dates */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {tripPlan.trip_type || 'Adventure'}
            </Badge>
            {tripPlan.start_date && (
              <Badge variant="outline">
                {new Date(tripPlan.start_date).toLocaleDateString()} - {new Date(tripPlan.end_date).toLocaleDateString()}
              </Badge>
            )}
            <Badge variant="outline">
              Saved {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recently'}
            </Badge>
          </div>

          {/* AI Description */}
          {tripPlan.ai_description && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  AI Trip Overview
                </h3>
                <p className="text-muted-foreground">{tripPlan.ai_description}</p>
              </CardContent>
            </Card>
          )}

          {/* Daily Itinerary */}
          {dailyPlans.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Daily Itinerary
              </h3>
              <div className="space-y-4">
                {dailyPlans.map((day, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 text-lg">
                        Day {day.day_number || index + 1}
                        {day.date && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({new Date(day.date).toLocaleDateString()})
                          </span>
                        )}
                      </h4>
                      
                      {day.activities && day.activities.length > 0 ? (
                        <div className="space-y-3">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="border-l-2 border-primary/20 pl-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium">{activity.name || activity.title}</h5>
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {activity.description}
                                    </p>
                                  )}
                                  {activity.location && (
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                      <MapPin size={12} className="mr-1" />
                                      {activity.location}
                                    </p>
                                  )}
                                </div>
                                {activity.time && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.time}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No activities planned for this day.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {tripPlan.preferences && Object.keys(tripPlan.preferences).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Trip Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tripPlan.preferences).map(([key, value]) => {
                    if (value === true) {
                      return (
                        <Badge key={key} variant="secondary">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {trip.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Personal Notes</h3>
                <p className="text-muted-foreground">{trip.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1">
              Edit Trip
            </Button>
            <Button variant="outline" className="flex-1">
              Share Trip
            </Button>
            <Button variant="outline" className="flex-1">
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripDetailsModal;