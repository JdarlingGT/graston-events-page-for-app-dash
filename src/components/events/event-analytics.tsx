"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Target,
  Mail,
  MousePointer,
  CreditCard,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventAnalyticsProps {
  eventId: string;
}

interface EnrollmentTrendPoint {
  date: string;
  enrolled: number;
  target: number;
  revenue: number;
}

interface FunnelStage {
  stage: string;
  value: number;
  fill: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  conversions: number;
  revenue: number;
}

interface Demographic {
  category: string;
  value: number;
  fill: string;
}

interface AnalyticsData {
  enrollmentTrend: EnrollmentTrendPoint[];
  conversionFunnel: FunnelStage[];
  trafficSources: TrafficSource[];
  demographics: Demographic[];
  performance: {
    totalViews: number;
    clickThroughRate: number;
    conversionRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    refundRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EventAnalytics({ eventId }: EventAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["event-analytics", eventId, timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!analytics) return null;

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = "number" 
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    format?: "number" | "currency" | "percentage";
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case "currency": return `$${val.toLocaleString()}`;
        case "percentage": return `${val.toFixed(1)}%`;
        default: return val.toLocaleString();
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
            </div>
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4 flex items-center">
            {change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn(
              "text-sm font-medium",
              change > 0 ? "text-green-500" : "text-red-500"
            )}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground ml-1">vs last period</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Analytics</h3>
        <div className="flex gap-2">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={analytics.performance.totalViews}
          change={12.5}
          icon={MousePointer}
        />
        <MetricCard
          title="Conversion Rate"
          value={analytics.performance.conversionRate}
          change={-2.1}
          icon={Target}
          format="percentage"
        />
        <MetricCard
          title="Avg Order Value"
          value={analytics.performance.averageOrderValue}
          change={8.3}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="CLV"
          value={analytics.performance.customerLifetimeValue}
          change={15.7}
          icon={Award}
          format="currency"
        />
      </div>

      <Tabs defaultValue="enrollment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment Trend</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment & Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div role="img" aria-label="Line chart showing enrollment and revenue trends over the selected time period.">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="enrolled"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Enrolled Students"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="target"
                      stroke="#82ca9d"
                      strokeDasharray="5 5"
                      name="Target"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ffc658"
                      strokeWidth={2}
                      name="Revenue ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div role="img" aria-label="Funnel chart illustrating the conversion rates through different stages from page views to course enrollment.">
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel
                      dataKey="value"
                      data={analytics.conversionFunnel}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {analytics.conversionFunnel.map((stage: FunnelStage, index: number) => (
                  <div key={stage.stage} className="text-center">
                    <div className="text-2xl font-bold">{stage.value.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{stage.stage}</div>
                    {index > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {((stage.value / analytics.conversionFunnel[index - 1].value) * 100).toFixed(1)}% conversion
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div role="img" aria-label="Bar chart comparing visitors and conversions from different traffic sources.">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.trafficSources}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#8884d8" name="Visitors" />
                    <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {analytics.trafficSources.map((source: TrafficSource) => (
                  <div key={source.source} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{source.source}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.visitors} visitors • {source.conversions} conversions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${source.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {((source.conversions / source.visitors) * 100).toFixed(1)}% CVR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Pie chart showing the demographic breakdown of students by professional category.">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.demographics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.demographics.map((entry: Demographic, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Click-through Rate</span>
                    <span>{analytics.performance.clickThroughRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.performance.clickThroughRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conversion Rate</span>
                    <span>{analytics.performance.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={analytics.performance.conversionRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Refund Rate</span>
                    <span>{analytics.performance.refundRate.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={analytics.performance.refundRate} 
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${analytics.performance.averageOrderValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Order Value</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${analytics.performance.customerLifetimeValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Customer LTV</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}