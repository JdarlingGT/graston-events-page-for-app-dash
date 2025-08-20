'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Mail,
  MessageSquare,
  Settings,
  X,
  Eye,
  Archive,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SmartNotificationsProps {
  className?: string;
}

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  category: 'enrollment' | 'forecast' | 'system' | 'marketing' | 'instructor';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  eventId?: string;
  eventName?: string;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  metadata?: {
    currentValue?: number;
    targetValue?: number;
    change?: number;
    unit?: string;
  };
}

interface NotificationSettings {
  enrollmentAlerts: boolean;
  forecastUpdates: boolean;
  systemNotifications: boolean;
  marketingInsights: boolean;
  instructorUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Mock notification data generator
const generateNotifications = (): Notification[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'alert',
      category: 'enrollment',
      priority: 'high',
      title: 'Event Below Minimum Enrollment',
      message: 'Essential Training in Cleveland, OH has only 2 enrollments (min: 8). Event is in 14 days.',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      read: false,
      actionable: true,
      eventId: 'evt-26025537',
      eventName: 'Essential In-Person | Cleveland, OH',
      actions: [
        { label: 'View Event', action: 'view', variant: 'outline' },
        { label: 'Send Marketing Blast', action: 'market', variant: 'default' },
        { label: 'Consider Cancellation', action: 'cancel', variant: 'destructive' },
      ],
      metadata: { currentValue: 2, targetValue: 8, unit: 'enrollments' },
    },
    {
      id: '2',
      type: 'warning',
      category: 'forecast',
      priority: 'medium',
      title: 'Attendance Forecast Updated',
      message: 'AI predicts Portland, ME event will reach only 5 enrollments (67% confidence).',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      read: false,
      actionable: true,
      eventId: 'evt-26012320',
      eventName: 'Essential Hybrid | Portland, ME',
      actions: [
        { label: 'View Forecast', action: 'forecast', variant: 'outline' },
        { label: 'Boost Marketing', action: 'market', variant: 'default' },
      ],
      metadata: { currentValue: 3, targetValue: 5, change: 67, unit: '% confidence' },
    },
    {
      id: '3',
      type: 'success',
      category: 'enrollment',
      priority: 'low',
      title: 'Event Reached Capacity',
      message: 'Westmont, IL event is now at full capacity with a waitlist of 3 people.',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      read: true,
      actionable: true,
      eventId: 'evt-26025852',
      eventName: 'Essential In-Person | Westmont, IL',
      actions: [
        { label: 'Manage Waitlist', action: 'waitlist', variant: 'default' },
        { label: 'Consider Additional Event', action: 'duplicate', variant: 'outline' },
      ],
      metadata: { currentValue: 25, targetValue: 25, unit: 'enrollments' },
    },
    {
      id: '4',
      type: 'info',
      category: 'marketing',
      priority: 'medium',
      title: 'Marketing Campaign Performance',
      message: 'Chicago area email campaign achieved 8.5% click-through rate, 15% above average.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionable: false,
      metadata: { currentValue: 8.5, targetValue: 7.4, change: 15, unit: '% CTR' },
    },
    {
      id: '5',
      type: 'info',
      category: 'instructor',
      priority: 'low',
      title: 'Instructor Schedule Update',
      message: 'Mike Ploski confirmed availability for 3 additional events in Q4.',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionable: true,
      actions: [
        { label: 'View Schedule', action: 'schedule', variant: 'outline' },
        { label: 'Assign Events', action: 'assign', variant: 'default' },
      ],
    },
    {
      id: '6',
      type: 'warning',
      category: 'system',
      priority: 'medium',
      title: 'Data Sync Delay',
      message: 'WooCommerce integration experienced a 15-minute delay. All data is now current.',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionable: false,
    },
  ];
};

export function SmartNotifications({ className }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enrollmentAlerts: true,
    forecastUpdates: true,
    systemNotifications: true,
    marketingInsights: true,
    instructorUpdates: true,
    emailNotifications: true,
    pushNotifications: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const queryClient = useQueryClient();

  // Simulate real-time notifications
  useEffect(() => {
    const initialNotifications = generateNotifications();
    setNotifications(initialNotifications);

    // Simulate new notifications every 30 seconds
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'alert' : 'info',
        category: ['enrollment', 'forecast', 'marketing'][Math.floor(Math.random() * 3)] as any,
        priority: Math.random() > 0.5 ? 'medium' : 'low',
        title: 'New Event Update',
        message: 'A new event-related update is available.',
        timestamp: new Date().toISOString(),
        read: false,
        actionable: Math.random() > 0.5,
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
      
      // Show toast for high priority notifications
      if (newNotification.priority === 'high' || newNotification.type === 'alert') {
        toast.error(newNotification.title, {
          description: newNotification.message,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionableCount = notifications.filter(n => n.actionable && !n.read).length;

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'alert') {
return AlertTriangle;
}
    if (type === 'success') {
return CheckCircle;
}
    if (type === 'warning') {
return Clock;
}
    
    switch (category) {
      case 'enrollment': return Users;
      case 'forecast': return TrendingUp;
      case 'marketing': return Mail;
      case 'instructor': return Users;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-red-500';
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n),
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notification: Notification, actionType: string) => {
    switch (actionType) {
      case 'view':
        // Navigate to event
        window.open(`/dashboard/events/${notification.eventId}`, '_blank');
        break;
      case 'forecast':
        // Show forecast modal or navigate
        toast.info('Opening attendance forecast...');
        break;
      case 'market':
        // Open marketing tools
        toast.info('Opening marketing tools...');
        break;
      case 'cancel':
        // Open cancellation wizard
        toast.warning('Opening cancellation wizard...');
        break;
      default:
        toast.info(`Action: ${actionType}`);
    }
    markAsRead(notification.id);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
return !notification.read;
}
    if (filter === 'actionable') {
return notification.actionable;
}
    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
return 'Just now';
}
    if (diffMins < 60) {
return `${diffMins}m ago`;
}
    if (diffHours < 24) {
return `${diffHours}h ago`;
}
    if (diffDays < 7) {
return `${diffDays}d ago`;
}
    return date.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
            Smart Notifications
            {actionableCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {actionableCount} Action Required
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Actionable'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('actionable')}>
                  Action Required
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {showSettings && (
          <div className="p-4 border-b bg-muted/20">
            <h4 className="font-semibold mb-3">Notification Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enrollment-alerts">Enrollment Alerts</Label>
                  <Switch
                    id="enrollment-alerts"
                    checked={settings.enrollmentAlerts}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, enrollmentAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="forecast-updates">Forecast Updates</Label>
                  <Switch
                    id="forecast-updates"
                    checked={settings.forecastUpdates}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, forecastUpdates: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-insights">Marketing Insights</Label>
                  <Switch
                    id="marketing-insights"
                    checked={settings.marketingInsights}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, marketingInsights: checked }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ 
                        ...prev, 
                        quietHours: { ...prev.quietHours, enabled: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications to display</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type, notification.category);
                return (
                  <div key={notification.id}>
                    <div
                      className={cn(
                        'p-3 rounded-lg border transition-colors hover:bg-muted/50',
                        !notification.read && 'bg-primary/5 border-primary/20',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Icon className={cn('h-4 w-4', getNotificationColor(notification.type))} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Badge variant={getPriorityBadge(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.eventName && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Event: {notification.eventName}
                            </p>
                          )}
                          
                          {notification.metadata && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              {notification.metadata.currentValue !== undefined && (
                                <span>
                                  Current: {notification.metadata.currentValue} {notification.metadata.unit}
                                </span>
                              )}
                              {notification.metadata.targetValue !== undefined && (
                                <span>
                                  Target: {notification.metadata.targetValue} {notification.metadata.unit}
                                </span>
                              )}
                              {notification.metadata.change !== undefined && (
                                <span className={notification.metadata.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {notification.metadata.change > 0 ? '+' : ''}{notification.metadata.change}%
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 px-2"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 px-2"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {notification.actions.map((action, actionIndex) => (
                                <Button
                                  key={actionIndex}
                                  variant={action.variant || 'outline'}
                                  size="sm"
                                  onClick={() => handleAction(notification, action.action)}
                                  className="h-7 text-xs"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}