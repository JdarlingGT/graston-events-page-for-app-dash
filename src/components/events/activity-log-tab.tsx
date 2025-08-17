"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Mail, 
  Calendar, 
  Users, 
  Edit, 
  Plus, 
  Trash, 
  MessageSquare,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: "user_action" | "system_event" | "email_sent" | "enrollment" | "edit" | "note" | "status_change";
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  metadata?: {
    studentName?: string;
    oldValue?: string;
    newValue?: string;
    emailSubject?: string;
    recipientCount?: number;
  };
}

interface ActivityLogTabProps {
  eventId: string;
}

// Mock activity log data - in a real app this would come from the API
const generateMockActivityLog = (eventId: string): ActivityLogEntry[] => [
  {
    id: "activity-1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: "enrollment",
    title: "New Student Enrollment",
    description: "Sarah Johnson enrolled and completed payment",
    user: {
      name: "System",
      role: "Automated"
    },
    metadata: {
      studentName: "Sarah Johnson"
    }
  },
  {
    id: "activity-2",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    type: "email_sent",
    title: "Bulk Email Sent",
    description: "Pre-course reminder email sent to all enrolled students",
    user: {
      name: "Mike Chen",
      avatar: "https://i.pravatar.cc/150?img=2",
      role: "Event Coordinator"
    },
    metadata: {
      emailSubject: "Don't forget: Complete your pre-course work",
      recipientCount: 23
    }
  },
  {
    id: "activity-3",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    type: "edit",
    title: "Event Details Updated",
    description: "Venue capacity increased from 25 to 30 students",
    user: {
      name: "Lisa Park",
      avatar: "https://i.pravatar.cc/150?img=3",
      role: "Event Manager"
    },
    metadata: {
      oldValue: "25",
      newValue: "30"
    }
  },
  {
    id: "activity-4",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    type: "note",
    title: "Internal Note Added",
    description: "Instructor confirmed arrival time and requested AV setup details",
    user: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      role: "Admin"
    }
  },
  {
    id: "activity-5",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    type: "status_change",
    title: "Event Status Changed",
    description: "Event status changed from Draft to Published",
    user: {
      name: "Lisa Park",
      avatar: "https://i.pravatar.cc/150?img=3",
      role: "Event Manager"
    },
    metadata: {
      oldValue: "Draft",
      newValue: "Published"
    }
  },
  {
    id: "activity-6",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    type: "user_action",
    title: "Materials Uploaded",
    description: "Course materials and handouts uploaded to student portal",
    user: {
      name: "Dr. Emily Carter",
      avatar: "https://i.pravatar.cc/150?img=4",
      role: "Instructor"
    }
  },
  {
    id: "activity-7",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    type: "enrollment",
    title: "Multiple Enrollments",
    description: "5 new students enrolled via corporate group registration",
    user: {
      name: "System",
      role: "Automated"
    },
    metadata: {
      recipientCount: 5
    }
  },
  {
    id: "activity-8",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    type: "user_action",
    title: "Event Created",
    description: "Event was created and initial setup completed",
    user: {
      name: "Lisa Park",
      avatar: "https://i.pravatar.cc/150?img=3",
      role: "Event Manager"
    }
  }
];

const getActivityIcon = (type: ActivityLogEntry["type"]) => {
  switch (type) {
    case "user_action": return User;
    case "system_event": return Settings;
    case "email_sent": return Mail;
    case "enrollment": return Users;
    case "edit": return Edit;
    case "note": return MessageSquare;
    case "status_change": return CheckCircle;
    default: return FileText;
  }
};

const getActivityColor = (type: ActivityLogEntry["type"]) => {
  switch (type) {
    case "enrollment": return "text-green-600 bg-green-100 dark:bg-green-900/20";
    case "email_sent": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    case "edit": return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    case "status_change": return "text-purple-600 bg-purple-100 dark:bg-purple-900/20";
    case "note": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
    case "system_event": return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  }
};

const getTypeLabel = (type: ActivityLogEntry["type"]) => {
  switch (type) {
    case "user_action": return "User Action";
    case "system_event": return "System Event";
    case "email_sent": return "Email";
    case "enrollment": return "Enrollment";
    case "edit": return "Edit";
    case "note": return "Note";
    case "status_change": return "Status Change";
    default: return "Activity";
  }
};

export function ActivityLogTab({ eventId }: ActivityLogTabProps) {
  const { data: activities = [], isLoading } = useQuery<ActivityLogEntry[]>({
    queryKey: ["event-activity-log", eventId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockActivityLog(eventId);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Chronological record of all event-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>
          Chronological record of all event-related activities and changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const isLast = index === activities.length - 1;
              
              return (
                <div key={activity.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background",
                    getActivityColor(activity.type)
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(activity.type)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        
                        {/* Metadata */}
                        {activity.metadata && (
                          <div className="text-xs text-muted-foreground mb-2 space-y-1">
                            {activity.metadata.studentName && (
                              <div>Student: {activity.metadata.studentName}</div>
                            )}
                            {activity.metadata.emailSubject && (
                              <div>Subject: "{activity.metadata.emailSubject}"</div>
                            )}
                            {activity.metadata.recipientCount && (
                              <div>Recipients: {activity.metadata.recipientCount}</div>
                            )}
                            {activity.metadata.oldValue && activity.metadata.newValue && (
                              <div>
                                Changed from "{activity.metadata.oldValue}" to "{activity.metadata.newValue}"
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {activity.user.avatar ? (
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={activity.user.avatar} />
                              <AvatarFallback>
                                {activity.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                              <Settings className="h-3 w-3" />
                            </div>
                          )}
                          <span>{activity.user.name}</span>
                          <span>•</span>
                          <span>{activity.user.role}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity recorded yet</p>
            <p className="text-sm">Activity will appear here as changes are made to the event</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}