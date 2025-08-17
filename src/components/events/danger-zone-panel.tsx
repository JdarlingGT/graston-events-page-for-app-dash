"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DangerZonePanelProps {
  event: {
    id: string;
    title: string;
    enrolledStudents: number;
    capacity: number;
    minViableEnrollment: number;
    registrationDeadline: string;
    revenue: number;
    projectedRevenue: number;
  };
}

export function DangerZonePanel({ event }: DangerZonePanelProps) {
  const enrollmentPercentage = (event.enrolledStudents / event.capacity) * 100;
  const viabilityPercentage = (event.enrolledStudents / event.minViableEnrollment) * 100;
  const daysUntilDeadline = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getRiskLevel = () => {
    if (event.enrolledStudents < event.minViableEnrollment && daysUntilDeadline < 14) {
      return {
        level: "critical",
        color: "destructive",
        icon: AlertTriangle,
        title: "Critical Risk",
        description: "Event may need to be cancelled",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800"
      };
    } else if (event.enrolledStudents < event.minViableEnrollment) {
      return {
        level: "high",
        color: "secondary",
        icon: TrendingDown,
        title: "High Risk",
        description: "Below minimum viable enrollment",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
        borderColor: "border-yellow-200 dark:border-yellow-800"
      };
    } else if (enrollmentPercentage < 60) {
      return {
        level: "moderate",
        color: "outline",
        icon: TrendingUp,
        title: "Moderate Risk",
        description: "Enrollment building steadily",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800"
      };
    } else {
      return {
        level: "low",
        color: "default",
        icon: TrendingUp,
        title: "Low Risk",
        description: "Healthy enrollment numbers",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        borderColor: "border-green-200 dark:border-green-800"
      };
    }
  };

  const risk = getRiskLevel();
  const RiskIcon = risk.icon;

  const getRecommendations = () => {
    const recommendations = [];
    
    if (event.enrolledStudents < event.minViableEnrollment) {
      recommendations.push("Launch targeted marketing campaign");
      recommendations.push("Offer early bird discount");
      recommendations.push("Contact past attendees");
    }
    
    if (daysUntilDeadline < 21) {
      recommendations.push("Send urgency-based emails");
      recommendations.push("Activate social media promotion");
    }
    
    if (enrollmentPercentage > 80) {
      recommendations.push("Prepare waitlist system");
      recommendations.push("Consider increasing capacity");
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Card className={cn("border-2", risk.bgColor, risk.borderColor)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiskIcon className="h-5 w-5" />
            <CardTitle className="text-lg">Danger Zone Analysis</CardTitle>
          </div>
          <Badge variant={risk.color as any} className="flex items-center gap-1">
            {risk.title}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Enrollment
            </div>
            <div className="text-2xl font-bold">
              {event.enrolledStudents}/{event.capacity}
            </div>
            <Progress value={enrollmentPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Viability
            </div>
            <div className="text-2xl font-bold">
              {Math.round(viabilityPercentage)}%
            </div>
            <Progress 
              value={viabilityPercentage} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Days Left
            </div>
            <div className="text-2xl font-bold">
              {daysUntilDeadline}
            </div>
            <div className="text-xs text-muted-foreground">
              Until deadline
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Revenue
            </div>
            <div className="text-2xl font-bold">
              ${event.revenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              of ${event.projectedRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Assessment
          </h4>
          <p className="text-sm text-muted-foreground">
            {risk.description}
          </p>
          
          {event.enrolledStudents < event.minViableEnrollment && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium text-destructive">
                ⚠️ Below minimum viable enrollment of {event.minViableEnrollment} students
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Recommended Actions</h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button size="sm" variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Send Reminder
          </Button>
          <Button size="sm" variant="outline">
            Launch Campaign
          </Button>
          <Button size="sm" variant="outline">
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}