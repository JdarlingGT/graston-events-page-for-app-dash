"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Mail,
  MoreHorizontal,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "warning" | "success" | "info" | "error";
  title: string;
  message: string;
  eventId?: string;
  eventName?: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  priority: "low" | "medium" | "high";
  data?: any;
}

interface EventNotificationsProps {
  eventId?: string;
  showAll?: boolean;
}

export function EventNotifications({ eventId, showAll = false }: EventNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: notificationsData, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications", eventId],
    queryFn: async () => {
      const url = eventId 
        ? `/api/events/${eventId}/notifications`
        : `/api/notifications`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      toast.error("Failed to dismiss notification");
    }
  };

  const handleAction = async (notification: Notification, action: string) => {
    try {
      await fetch(`/api/notifications/${notification.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: notification.data }),
      });
      toast.success("Action completed successfully");
      markAsRead(notification.id);
    } catch (error) {
      toast.error("Failed to complete action");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning": return AlertTriangle;
      case "success": return CheckCircle;
      case "error": return AlertTriangle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") {
      return "border-red-200 bg-red-50 dark:bg-red-950/20";
    }
    switch (type) {
      case "warning": return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20";
      case "success": return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20";
      case "error": return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20";
      default: return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === "high").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                notifications.forEach(n => {
                  if (!n.read) markAsRead(n.id);
                });
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, showAll ? undefined : 5).map((notification: Notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    getNotificationColor(notification.type, notification.priority),
                    !notification.read && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn(
                      "h-5 w-5 mt-0.5",
                      notification.type === "warning" && "text-yellow-600",
                      notification.type === "success" && "text-green-600",
                      notification.type === "error" && "text-red-600",
                      notification.type === "info" && "text-blue-600"
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.eventName && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {notification.eventName}
                            </Badge>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" aria-label={`More options for notification: ${notification.title}`}>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            {notification.actionable && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAction(notification, "resolve")}>
                                  Resolve issue
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction(notification, "snooze")}>
                                  Snooze for 1 hour
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => dismissNotification(notification.id)}
                              className="text-destructive"
                            >
                              Dismiss
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                        
                        {notification.actionable && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(notification, "view")}
                            >
                              View Details
                            </Button>
                            {notification.type === "warning" && (
                              <Button
                                size="sm"
                                onClick={() => handleAction(notification, "fix")}
                              >
                                Fix Now
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!showAll && notifications.length > 5 && (
              <Button variant="ghost" className="w-full">
                View all {notifications.length} notifications
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}