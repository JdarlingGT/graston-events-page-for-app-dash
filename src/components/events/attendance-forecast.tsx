'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Brain,
  Target,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceForecastProps {
  eventId: string;
  currentEnrollment: number;
  capacity: number;
  minViable: number;
  daysUntilEvent: number;
  eventType?: string;
  location?: string;
  instructor?: string;
}

interface ForecastData {
  eventId: string;
  currentEnrollment: number;
  capacity: number;
  minViable: number;
  daysUntilEvent: number;
  historicalData: {
    similarEvents: number;
    averageEnrollmentRate: number;
    seasonalFactor: number;
  };
  predictions: {
    finalEnrollment: {
      predicted: number;
      confidence: number;
      range: { min: number; max: number };
    };
    enrollmentTrend: Array<{
      date: string;
      predicted: number;
      confidence: number;
    }>;
    riskAssessment: {
      level: 'low' | 'medium' | 'high' | 'critical';
      factors: string[];
      recommendations: string[];
    };
  };
}

export function AttendanceForecast({
  eventId,
  currentEnrollment,
  capacity,
  minViable,
  daysUntilEvent,
  eventType,
  location,
  instructor,
}: AttendanceForecastProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: forecast, isLoading, error, refetch } = useQuery<ForecastData>({
    queryKey: ['attendance-forecast', eventId, currentEnrollment, daysUntilEvent],
    queryFn: async () => {
      const params = new URLSearchParams({
        enrollment: currentEnrollment.toString(),
        capacity: capacity.toString(),
        minViable: minViable.toString(),
        daysUntil: daysUntilEvent.toString(),
        ...(eventType && { type: eventType }),
        ...(location && { location }),
        ...(instructor && { instructor }),
      });

      const response = await fetch(`/api/events/${eventId}/forecast?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance forecast');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Users;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Attendance Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !forecast) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Attendance Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load attendance forecast. 
              <Button variant="link" className="p-0 h-auto ml-2" onClick={() => refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { predictions } = forecast;
  const RiskIcon = getRiskIcon(predictions.riskAssessment.level);
  const enrollmentProgress = (currentEnrollment / capacity) * 100;
  const predictedProgress = (predictions.finalEnrollment.predicted / capacity) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Attendance Forecast
          </CardTitle>
          <Badge variant={getRiskColor(predictions.riskAssessment.level)} className="flex items-center gap-1">
            <RiskIcon className="h-3 w-3" />
            {predictions.riskAssessment.level.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Predicted Final Enrollment
            </div>
            <div className="text-2xl font-bold">
              {predictions.finalEnrollment.predicted}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {capacity}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(predictions.finalEnrollment.confidence * 100)}% confidence
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Days Remaining
            </div>
            <div className="text-2xl font-bold">{daysUntilEvent}</div>
            <div className="text-xs text-muted-foreground">
              Until event date
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Current vs Predicted
            </div>
            <div className="flex items-center gap-2">
              {predictions.finalEnrollment.predicted > currentEnrollment ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-lg font-semibold">
                {predictions.finalEnrollment.predicted > currentEnrollment ? '+' : ''}
                {predictions.finalEnrollment.predicted - currentEnrollment}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Expected change
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Current Enrollment</span>
            <span>{currentEnrollment} / {capacity}</span>
          </div>
          <Progress value={enrollmentProgress} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span>Predicted Final</span>
            <span>{predictions.finalEnrollment.predicted} / {capacity}</span>
          </div>
          <Progress value={predictedProgress} className="h-2 opacity-60" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Range: {predictions.finalEnrollment.range.min} - {predictions.finalEnrollment.range.max}</span>
            <span>Min Viable: {minViable}</span>
          </div>
        </div>

        {/* Enrollment Trend Chart */}
        {showDetails && (
          <div className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions.enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(value) => `Date: ${formatDate(value as string)}`}
                    formatter={(value: number, name: string) => [
                      `${value} students`,
                      name === 'predicted' ? 'Predicted Enrollment' : name
                    ]}
                  />
                  <ReferenceLine 
                    y={minViable} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    label="Min Viable"
                  />
                  <ReferenceLine 
                    y={capacity} 
                    stroke="#22c55e" 
                    strokeDasharray="5 5" 
                    label="Capacity"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Predicted Enrollment"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Factors and Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {predictions.riskAssessment.factors.map((factor, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Recommendations
                </h4>
                <ul className="space-y-1">
                  {predictions.riskAssessment.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Historical Context */}
            <div className="bg-muted/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Historical Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Similar Events:</span>
                  <span className="ml-2 font-medium">{forecast.historicalData.similarEvents}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Enrollment Rate:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(forecast.historicalData.averageEnrollmentRate * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Seasonal Factor:</span>
                  <span className="ml-2 font-medium">
                    {forecast.historicalData.seasonalFactor.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Details Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Detailed Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}