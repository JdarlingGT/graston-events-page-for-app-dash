'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Coffee, BookOpen, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  type: 'registration' | 'session' | 'break' | 'lunch' | 'activity' | 'closing';
  duration?: string;
  location?: string;
}

interface EventScheduleTimelineProps {
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

// Mock schedule data - in a real app this would come from the API
const mockScheduleItems: ScheduleItem[] = [
  {
    time: '8:30 AM',
    title: 'Registration & Check-in',
    description: 'Welcome coffee and networking',
    type: 'registration',
    duration: '30 min',
    location: 'Main Lobby',
  },
  {
    time: '9:00 AM',
    title: 'Opening & Introductions',
    description: 'Welcome remarks and course overview',
    type: 'session',
    duration: '30 min',
    location: 'Main Hall',
  },
  {
    time: '9:30 AM',
    title: 'Module 1: Fundamentals',
    description: 'Core concepts and theoretical foundation',
    type: 'session',
    duration: '90 min',
    location: 'Main Hall',
  },
  {
    time: '11:00 AM',
    title: 'Morning Break',
    description: 'Coffee and light refreshments',
    type: 'break',
    duration: '15 min',
    location: 'Lobby',
  },
  {
    time: '11:15 AM',
    title: 'Module 2: Hands-on Practice',
    description: 'Interactive workshop and practical exercises',
    type: 'session',
    duration: '105 min',
    location: 'Main Hall',
  },
  {
    time: '1:00 PM',
    title: 'Lunch Break',
    description: 'Catered lunch and networking',
    type: 'lunch',
    duration: '60 min',
    location: 'Dining Area',
  },
  {
    time: '2:00 PM',
    title: 'Module 3: Advanced Techniques',
    description: 'Advanced concepts and case studies',
    type: 'session',
    duration: '90 min',
    location: 'Main Hall',
  },
  {
    time: '3:30 PM',
    title: 'Afternoon Break',
    description: 'Coffee and networking',
    type: 'break',
    duration: '15 min',
    location: 'Lobby',
  },
  {
    time: '3:45 PM',
    title: 'Module 4: Q&A and Assessment',
    description: 'Questions, review, and competency assessment',
    type: 'session',
    duration: '75 min',
    location: 'Main Hall',
  },
  {
    time: '5:00 PM',
    title: 'Closing & Certificates',
    description: 'Certificate presentation and wrap-up',
    type: 'closing',
    duration: '30 min',
    location: 'Main Hall',
  },
];

const getItemIcon = (type: ScheduleItem['type']) => {
  switch (type) {
    case 'registration': return Users;
    case 'session': return BookOpen;
    case 'break': return Coffee;
    case 'lunch': return Coffee;
    case 'activity': return Users;
    case 'closing': return Award;
    default: return Clock;
  }
};

const getItemColor = (type: ScheduleItem['type']) => {
  switch (type) {
    case 'registration': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    case 'session': return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'break': return 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    case 'lunch': return 'bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    case 'activity': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'closing': return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    default: return 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  }
};

const getTypeLabel = (type: ScheduleItem['type']) => {
  switch (type) {
    case 'registration': return 'Registration';
    case 'session': return 'Session';
    case 'break': return 'Break';
    case 'lunch': return 'Lunch';
    case 'activity': return 'Activity';
    case 'closing': return 'Closing';
    default: return 'Event';
  }
};

export function EventScheduleTimeline({ schedule }: EventScheduleTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Event Schedule
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>{formatDate(schedule.startDate)}</p>
          <p>{schedule.startTime} - {schedule.endTime} ({schedule.timezone})</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {mockScheduleItems.map((item, index) => {
              const Icon = getItemIcon(item.type);
              const isLast = index === mockScheduleItems.length - 1;
              
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-border">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  {/* Content */}
                  <div className={cn(
                    'flex-1 rounded-lg border p-4 transition-all hover:shadow-sm',
                    getItemColor(item.type),
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">{item.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                          {item.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {item.duration}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-base mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Schedule Notes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• All times are in {schedule.timezone}</li>
            <li>• Please arrive 15 minutes early for registration</li>
            <li>• Lunch and refreshments are provided</li>
            <li>• Certificates will be distributed at the end of the session</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}