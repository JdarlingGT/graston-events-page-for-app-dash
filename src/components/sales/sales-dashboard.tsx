'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MapPin, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Mail,
  Phone,
  MessageSquare,
  RefreshCw,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SalesSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalEvents: number;
  eventsGrowth: number;
  averageAttendance: number;
  attendanceGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    events: number;
    attendees: number;
  }>;
  courseTypePerformance: Array<{
    type: string;
    revenue: number;
    events: number;
    averagePrice: number;
    attendees: number;
  }>;
  regionalPerformance: Array<{
    region: string;
    revenue: number;
    events: number;
    growth: number;
    marketPenetration: number;
  }>;
  opportunities: Array<{
    type: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
    estimatedValue: number;
  }>;
  kpis: {
    customerLifetimeValue: number;
    customerAcquisitionCost: number;
    repeatCustomerRate: number;
    averageDealSize: number;
    salesCycleLength: number;
    leadConversionRate: number;
  };
}

interface TargetingResults {
  totalTargetableProspects: number;
  highValueProspects: Array<{
    email: string;
    name?: string;
    engagementScore: number;
    nextLevelEligibility: {
      eligible: boolean;
      recommendedCourse?: string;
      readinessScore: number;
    };
  }>;
  locationRecommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    location: {
      city: string;
      state: string;
    };
    estimatedAttendees: number;
    recommendedCourseType: string;
    expectedROI: number;
  }>;
  campaignSuggestions: {
    emailCampaigns: Array<{
      name: string;
      targetSegment: string;
      estimatedReach: number;
      expectedConversion: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function SalesDashboard() {
  const [timeframe, setTimeframe] = useState('6months');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch sales summary
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['sales-summary', timeframe],
    queryFn: async (): Promise<SalesSummary> => {
      const response = await fetch(`/api/sales/summary?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch sales data');
      return response.json();
    },
  });

  // Fetch targeting data
  const { data: targetingData, isLoading: targetingLoading } = useQuery({
    queryKey: ['sales-targeting'],
    queryFn: async (): Promise<TargetingResults> => {
      const response = await fetch('/api/sales/targeting');
      if (!response.ok) throw new Error('Failed to fetch targeting data');
      return response.json();
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSales()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (salesLoading || targetingLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading sales intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Intelligence Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive sales analytics, targeting, and outreach management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targeting">Intelligent Targeting</TabsTrigger>
          <TabsTrigger value="outreach">AI Outreach</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesData?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={salesData?.revenueGrowth && salesData.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {salesData?.revenueGrowth ? formatPercentage(salesData.revenueGrowth) : '0%'}
                  </span>
                  {' '}from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={salesData?.eventsGrowth && salesData.eventsGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {salesData?.eventsGrowth ? formatPercentage(salesData.eventsGrowth) : '0%'}
                  </span>
                  {' '}from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData?.averageAttendance || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={salesData?.attendanceGrowth && salesData.attendanceGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {salesData?.attendanceGrowth ? formatPercentage(salesData.attendanceGrowth) : '0%'}
                  </span>
                  {' '}from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData?.conversionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className={salesData?.conversionGrowth && salesData.conversionGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {salesData?.conversionGrowth ? formatPercentage(salesData.conversionGrowth) : '0%'}
                  </span>
                  {' '}from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Course Type Performance</CardTitle>
                <CardDescription>Revenue by course type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={salesData?.courseTypePerformance || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {(salesData?.courseTypePerformance || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Opportunities</CardTitle>
              <CardDescription>Identified opportunities to increase revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData?.opportunities?.map((opportunity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={getPriorityColor(opportunity.priority)}>
                        {opportunity.priority}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{opportunity.type}</h4>
                        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(opportunity.estimatedValue)}</div>
                      <div className="text-sm text-muted-foreground">{opportunity.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Targetable Prospects</CardTitle>
                <CardDescription>Total prospects in database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{targetingData?.totalTargetableProspects?.toLocaleString() || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  High-value prospects: {targetingData?.highValueProspects?.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Opportunities</CardTitle>
                <CardDescription>High-priority markets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {targetingData?.locationRecommendations?.filter(l => l.priority === 'high').length || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total markets: {targetingData?.locationRecommendations?.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Suggestions</CardTitle>
                <CardDescription>Ready-to-launch campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {targetingData?.campaignSuggestions?.emailCampaigns?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Email campaigns ready
                </p>
              </CardContent>
            </Card>
          </div>

          {/* High-Value Prospects */}
          <Card>
            <CardHeader>
              <CardTitle>High-Value Prospects</CardTitle>
              <CardDescription>Top prospects based on engagement scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targetingData?.highValueProspects?.slice(0, 10).map((prospect, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{prospect.name || prospect.email}</h4>
                        <p className="text-sm text-muted-foreground">
                          Engagement Score: {prospect.engagementScore}/100
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {prospect.nextLevelEligibility.eligible && (
                        <Badge variant="default">
                          Ready for {prospect.nextLevelEligibility.recommendedCourse}
                        </Badge>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        Readiness: {prospect.nextLevelEligibility.readinessScore}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Market Expansion Opportunities</CardTitle>
              <CardDescription>Recommended locations for new events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targetingData?.locationRecommendations?.slice(0, 5).map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{rec.location.city}, {rec.location.state}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rec.estimatedAttendees} estimated attendees • {rec.recommendedCourseType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{rec.expectedROI.toFixed(0)}% ROI</div>
                      <div className="text-sm text-muted-foreground">Expected return</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Active templates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.3%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">All campaigns compliant</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Create Campaign</CardTitle>
                <CardDescription>Launch a new outreach campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Library</CardTitle>
                <CardDescription>Browse and edit templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Manage Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Check</CardTitle>
                <CardDescription>Review compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Audit
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Latest outreach campaign performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Q4 Advanced Course Promotion', sent: 245, opened: 147, clicked: 32, status: 'completed' },
                  { name: 'Follow-up: Engaged Prospects', sent: 156, opened: 98, clicked: 28, status: 'active' },
                  { name: 'Upsell: Essential Graduates', sent: 89, opened: 67, clicked: 23, status: 'completed' },
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.sent} sent • {campaign.opened} opened • {campaign.clicked} clicked
                        </p>
                      </div>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
                <CardDescription>Average value per customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesData?.kpis?.customerLifetimeValue || 0)}</div>
                <Progress value={75} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">75% of target</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Cost</CardTitle>
                <CardDescription>Cost to acquire new customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesData?.kpis?.customerAcquisitionCost || 0)}</div>
                <Progress value={60} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Below industry average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repeat Customer Rate</CardTitle>
                <CardDescription>Percentage of returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData?.kpis?.repeatCustomerRate || 0}%</div>
                <Progress value={salesData?.kpis?.repeatCustomerRate || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">Strong retention</p>
              </CardContent>
            </Card>
          </div>

          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Revenue and growth by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData?.regionalPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="events" fill="#82ca9d" name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}