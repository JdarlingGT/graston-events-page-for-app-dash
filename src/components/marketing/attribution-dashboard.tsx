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
  MousePointer,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Mail,
  Search,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Funnel,
  Route,
  Eye,
  ShoppingCart,
  CreditCard,
  User,
  Globe,
  Facebook,
  MessageCircle,
  Linkedin
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
  Sankey,
} from 'recharts';

interface FunnelData {
  overview: {
    totalVisitors: number;
    totalConversions: number;
    overallConversionRate: number;
    totalRevenue: number;
    totalCost: number;
    overallROI: number;
    avgCustomerLifetimeValue: number;
    avgCustomerAcquisitionCost: number;
    period: string;
  };
  funnelStages: Array<{
    name: string;
    visitors: number;
    conversionRate: number;
    dropoffRate: number;
    avgTimeInStage: number;
    revenue: number;
    cost: number;
    roi: number;
  }>;
  touchpoints: Array<{
    id: string;
    channel: string;
    campaign: string;
    source: string;
    medium: string;
    content: string;
    touchpointType: 'first_touch' | 'last_touch' | 'assisted' | 'direct';
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    cost: number;
    roi: number;
    avgOrderValue: number;
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
  }>;
  attributionModels: Array<{
    name: string;
    description: string;
    weight: number;
    touchpoints: Array<{
      touchpointId: string;
      attribution: number;
      revenue: number;
      conversions: number;
    }>;
    totalAttributedRevenue: number;
    totalAttributedConversions: number;
  }>;
  campaignPerformance: Array<{
    id: string;
    name: string;
    channel: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    roas: number;
    cpa: number;
    status: 'active' | 'paused' | 'completed';
    targetAudience: string;
    creativeAssets: string[];
    landingPages: string[];
  }>;
  customerJourneys: Array<{
    customerId: string;
    customerEmail: string;
    customerName: string;
    journey: Array<{
      timestamp: string;
      channel: string;
      campaign: string;
      touchpoint: string;
      action: string;
      value?: number;
      conversionStage: string;
    }>;
    totalTouchpoints: number;
    firstTouchChannel: string;
    lastTouchChannel: string;
    conversionPath: string[];
    totalRevenue: number;
    acquisitionCost: number;
    journeyDuration: number;
  }>;
  insights: {
    topPerformingChannels: Array<{
      channel: string;
      revenue: number;
      roas: number;
      conversions: number;
    }>;
    underperformingCampaigns: Array<{
      campaign: string;
      channel: string;
      roas: number;
      issues: string[];
    }>;
    optimizationOpportunities: Array<{
      type: string;
      description: string;
      potentialImpact: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  generatedAt: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const CHANNEL_ICONS = {
  'Google Ads': Search,
  'Facebook': Facebook,
  'Email': Mail,
  'Organic Search': Globe,
  'LinkedIn': Linkedin,
  'Direct': User,
};

export function AttributionDashboard() {
  const [timeframe, setTimeframe] = useState('30days');
  const [channel, setChannel] = useState('');
  const [campaign, setCampaign] = useState('');
  const [attributionModel, setAttributionModel] = useState('linear');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading, refetch: refetchFunnel } = useQuery({
    queryKey: ['marketing-funnel-data', timeframe, channel, campaign, attributionModel],
    queryFn: async (): Promise<FunnelData> => {
      const params = new URLSearchParams({
        timeframe,
        ...(channel && { channel }),
        ...(campaign && { campaign }),
        attributionModel,
      });
      const response = await fetch(`/api/marketing/funnel-data?${params}`);
      if (!response.ok) throw new Error('Failed to fetch funnel data');
      return response.json();
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchFunnel();
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getChannelIcon = (channelName: string) => {
    const Icon = CHANNEL_ICONS[channelName as keyof typeof CHANNEL_ICONS] || Target;
    return <Icon className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (funnelLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading marketing attribution data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Attribution Dashboard</h1>
          <p className="text-muted-foreground">
            Multi-touch attribution with GA4 + WooCommerce + FluentCRM integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={attributionModel} onValueChange={setAttributionModel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_touch">Last Touch</SelectItem>
              <SelectItem value="first_touch">First Touch</SelectItem>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="time_decay">Time Decay</SelectItem>
              <SelectItem value="position_based">Position Based</SelectItem>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="channel-filter">Channel</Label>
              <Input
                id="channel-filter"
                placeholder="Filter by channel..."
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="campaign-filter">Campaign</Label>
              <Input
                id="campaign-filter"
                placeholder="Filter by campaign..."
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setChannel(''); setCampaign(''); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="journeys">Customer Journeys</TabsTrigger>
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
                <div className="text-2xl font-bold">{formatCurrency(funnelData?.overview.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.5%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(funnelData?.overview.totalConversions || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8.3%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{funnelData?.overview.overallROI.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+5.2%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{funnelData?.overview.overallConversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2.1%</span> from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Channels</CardTitle>
              <CardDescription>Revenue and ROAS by marketing channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData?.insights.topPerformingChannels || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => 
                    name === 'revenue' ? formatCurrency(Number(value)) : 
                    name === 'roas' ? `${value}x` : 
                    formatNumber(Number(value))
                  } />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="roas" fill="#82ca9d" name="ROAS" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Optimization Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Opportunities</CardTitle>
              <CardDescription>AI-recommended improvements for marketing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData?.insights.optimizationOpportunities?.map((opportunity, index) => (
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
                      <div className="font-medium text-green-600">{opportunity.potentialImpact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Funnel Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Visitor progression through conversion stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData?.funnelStages?.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stage.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(stage.visitors)} visitors
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={stage.conversionRate} className="flex-1" />
                        <span className="text-sm font-medium">{stage.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dropoff: {stage.dropoffRate.toFixed(1)}% • Avg time: {stage.avgTimeInStage}m
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Funnel Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Funnel Metrics</CardTitle>
                <CardDescription>Key performance indicators by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData?.funnelStages?.map((stage, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 p-3 border rounded-lg">
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="font-medium">{formatCurrency(stage.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Cost</div>
                        <div className="font-medium">{formatCurrency(stage.cost)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                        <div className={`font-medium ${stage.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stage.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Attribution Model Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Attribution Models</CardTitle>
                <CardDescription>Revenue attribution by model type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData?.attributionModels || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="totalAttributedRevenue" fill="#8884d8" name="Attributed Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Touchpoint Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Touchpoint Performance</CardTitle>
                <CardDescription>Performance by marketing touchpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData?.touchpoints?.map((touchpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getChannelIcon(touchpoint.channel)}
                        </div>
                        <div>
                          <h4 className="font-medium">{touchpoint.channel}</h4>
                          <p className="text-sm text-muted-foreground">{touchpoint.campaign}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(touchpoint.revenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          {touchpoint.conversions} conversions • {touchpoint.roi.toFixed(1)}% ROI
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {funnelData?.campaignPerformance?.map((campaign, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{campaign.name}</span>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{campaign.channel}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Spent</div>
                        <div className="font-medium">{formatCurrency(campaign.spent)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="font-medium">{formatCurrency(campaign.revenue)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">ROAS</div>
                        <div className={`font-medium ${campaign.roas > 5 ? 'text-green-600' : 'text-red-600'}`}>
                          {campaign.roas.toFixed(1)}x
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">CPA</div>
                        <div className="font-medium">{formatCurrency(campaign.cpa)}</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground">CTR: {campaign.ctr.toFixed(2)}%</div>
                      <Progress value={campaign.conversionRate * 10} className="mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Conversion Rate: {campaign.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customer Journeys Tab */}
        <TabsContent value="journeys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Examples</CardTitle>
              <CardDescription>Sample customer paths to conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {funnelData?.customerJourneys?.map((journey, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{journey.customerName}</h4>
                        <p className="text-sm text-muted-foreground">{journey.customerEmail}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(journey.totalRevenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          {journey.journeyDuration} days • {journey.totalTouchpoints} touchpoints
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {journey.conversionPath.map((channel, pathIndex) => (
                        <React.Fragment key={pathIndex}>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              {getChannelIcon(channel)}
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">{channel}</span>
                          </div>
                          {pathIndex < journey.conversionPath.length - 1 && (
                            <div className="text-gray-400">→</div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      First touch: {journey.firstTouchChannel} • Last touch: {journey.lastTouchChannel}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}