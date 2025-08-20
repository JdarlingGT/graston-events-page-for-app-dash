'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Target,
  Lightbulb,
  Zap,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntelligentInsightsProps {
  className?: string;
}

interface InsightData {
  summary: {
    totalEvents: number;
    atRiskEvents: number;
    averageEnrollment: number;
    revenueImpact: number;
    trendsDirection: 'up' | 'down' | 'stable';
  };
  keyInsights: Array<{
    id: string;
    type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    actionable: boolean;
    metrics?: {
      current: number;
      target: number;
      unit: string;
    };
  }>;
  performanceMetrics: {
    enrollmentTrends: Array<{
      month: string;
      enrollment: number;
      capacity: number;
      utilization: number;
    }>;
    locationPerformance: Array<{
      location: string;
      events: number;
      avgEnrollment: number;
      successRate: number;
    }>;
    instructorPerformance: Array<{
      instructor: string;
      events: number;
      avgEnrollment: number;
      satisfaction: number;
    }>;
  };
  predictions: {
    nextQuarter: {
      expectedEvents: number;
      projectedRevenue: number;
      riskEvents: number;
    };
    seasonalTrends: Array<{
      period: string;
      demand: number;
      recommendation: string;
    }>;
  };
}

// Mock data generator for intelligent insights
const generateInsights = (): InsightData => {
  return {
    summary: {
      totalEvents: 45,
      atRiskEvents: 8,
      averageEnrollment: 18.5,
      revenueImpact: 125000,
      trendsDirection: 'up',
    },
    keyInsights: [
      {
        id: '1',
        type: 'risk',
        priority: 'high',
        title: 'Multiple Events Below Minimum Viable Enrollment',
        description: '8 upcoming events are currently below their minimum viable enrollment threshold.',
        impact: 'Potential revenue loss of $48,000 if events are cancelled',
        actionable: true,
        metrics: { current: 8, target: 3, unit: 'events' },
      },
      {
        id: '2',
        type: 'opportunity',
        priority: 'high',
        title: 'High Demand in Chicago Market',
        description: 'Chicago area events consistently fill to 95% capacity with waitlists.',
        impact: 'Opportunity to add 2-3 additional events for $75,000 revenue',
        actionable: true,
        metrics: { current: 95, target: 100, unit: '% capacity' },
      },
      {
        id: '3',
        type: 'trend',
        priority: 'medium',
        title: 'Virtual Event Enrollment Declining',
        description: 'Virtual events showing 15% decline in enrollment over past 3 months.',
        impact: 'May need to adjust virtual event strategy or pricing',
        actionable: true,
        metrics: { current: 12, target: 18, unit: 'avg enrollment' },
      },
      {
        id: '4',
        type: 'recommendation',
        priority: 'medium',
        title: 'Optimize Instructor Allocation',
        description: 'Top-performing instructors could be better distributed across high-demand markets.',
        impact: 'Potential 20% improvement in overall enrollment rates',
        actionable: true,
      },
    ],
    performanceMetrics: {
      enrollmentTrends: [
        { month: 'Jan', enrollment: 420, capacity: 500, utilization: 84 },
        { month: 'Feb', enrollment: 380, capacity: 475, utilization: 80 },
        { month: 'Mar', enrollment: 445, capacity: 525, utilization: 85 },
        { month: 'Apr', enrollment: 465, capacity: 550, utilization: 85 },
        { month: 'May', enrollment: 490, capacity: 575, utilization: 85 },
        { month: 'Jun', enrollment: 520, capacity: 600, utilization: 87 },
      ],
      locationPerformance: [
        { location: 'Chicago, IL', events: 8, avgEnrollment: 22.5, successRate: 95 },
        { location: 'Indianapolis, IN', events: 6, avgEnrollment: 19.2, successRate: 88 },
        { location: 'New York, NY', events: 5, avgEnrollment: 21.8, successRate: 92 },
        { location: 'Los Angeles, CA', events: 4, avgEnrollment: 16.5, successRate: 75 },
        { location: 'Virtual', events: 12, avgEnrollment: 14.2, successRate: 70 },
      ],
      instructorPerformance: [
        { instructor: 'Mike Ploski', events: 12, avgEnrollment: 21.5, satisfaction: 4.8 },
        { instructor: 'Kristin White', events: 8, avgEnrollment: 19.8, satisfaction: 4.7 },
        { instructor: 'Dr Reena Pathak', events: 6, avgEnrollment: 18.2, satisfaction: 4.6 },
        { instructor: 'Greg Kelley', events: 10, avgEnrollment: 15.5, satisfaction: 4.4 },
        { instructor: 'Michael Racette', events: 7, avgEnrollment: 20.1, satisfaction: 4.7 },
      ],
    },
    predictions: {
      nextQuarter: {
        expectedEvents: 38,
        projectedRevenue: 285000,
        riskEvents: 6,
      },
      seasonalTrends: [
        { period: 'Q3 2025', demand: 85, recommendation: 'Maintain current capacity' },
        { period: 'Q4 2025', demand: 92, recommendation: 'Increase capacity by 15%' },
        { period: 'Q1 2026', demand: 78, recommendation: 'Focus on retention programs' },
        { period: 'Q2 2026', demand: 88, recommendation: 'Expand virtual offerings' },
      ],
    },
  };
};

export function IntelligentInsights({ className }: IntelligentInsightsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: insights, isLoading } = useQuery<InsightData>({
    queryKey: ['intelligent-insights'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateInsights();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Star;
      case 'risk': return AlertTriangle;
      case 'trend': return TrendingUp;
      case 'recommendation': return Lightbulb;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'risk') {
return 'destructive';
}
    if (type === 'opportunity') {
return 'default';
}
    if (priority === 'high') {
return 'secondary';
}
    return 'outline';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligent Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
return null;
}

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Intelligent Insights
          <Badge variant="secondary" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-2xl font-bold">{insights.summary.totalEvents}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">At Risk Events</p>
                      <p className="text-2xl font-bold text-red-600">{insights.summary.atRiskEvents}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Enrollment</p>
                      <p className="text-2xl font-bold">{insights.summary.averageEnrollment}</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue Impact</p>
                      <p className="text-2xl font-bold">${insights.summary.revenueImpact.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrollment Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insights.performanceMetrics.enrollmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="enrollment"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Enrollment"
                      />
                      <Line
                        type="monotone"
                        dataKey="capacity"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Capacity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights.keyInsights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <Card key={insight.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge variant={getInsightColor(insight.type, insight.priority)}>
                            {insight.type}
                          </Badge>
                          <span className={cn('text-xs font-medium', getPriorityColor(insight.priority))}>
                            {insight.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        <p className="text-sm font-medium">{insight.impact}</p>
                        {insight.metrics && (
                          <div className="flex items-center gap-4 text-sm">
                            <span>Current: {insight.metrics.current} {insight.metrics.unit}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>Target: {insight.metrics.target} {insight.metrics.unit}</span>
                          </div>
                        )}
                        {insight.actionable && (
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.performanceMetrics.locationPerformance.map((location, index) => (
                      <div key={location.location} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{location.location}</span>
                          <span className="text-sm text-muted-foreground">
                            {location.avgEnrollment} avg enrollment
                          </span>
                        </div>
                        <Progress value={location.successRate} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{location.events} events</span>
                          <span>{location.successRate}% success rate</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.performanceMetrics.instructorPerformance.map((instructor) => (
                      <div key={instructor.instructor} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{instructor.instructor}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{instructor.satisfaction}</span>
                          </div>
                        </div>
                        <Progress value={(instructor.avgEnrollment / 25) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{instructor.events} events</span>
                          <span>{instructor.avgEnrollment} avg enrollment</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            {/* Next Quarter Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Next Quarter Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{insights.predictions.nextQuarter.expectedEvents}</div>
                    <div className="text-sm text-muted-foreground">Expected Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${insights.predictions.nextQuarter.projectedRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Projected Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{insights.predictions.nextQuarter.riskEvents}</div>
                    <div className="text-sm text-muted-foreground">Risk Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Demand Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.predictions.seasonalTrends.map((trend) => (
                    <div key={trend.period} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <div className="font-medium">{trend.period}</div>
                        <div className="text-sm text-muted-foreground">{trend.recommendation}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{trend.demand}%</div>
                        <div className="text-xs text-muted-foreground">Demand</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}