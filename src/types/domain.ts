/**
 * Centralized domain types for Events, Instructors, Students, Venues, Tasks,
 * Notifications, Sales, Marketing, and Accounting.
 * These types are mirrored by Zod schemas in src/lib/schemas/domain.ts
 */

// Shared enums/unions
export type EventMode = 'In-Person' | 'Virtual' | 'Hybrid';
export type EventStatus = 'upcoming' | 'cancelled' | 'completed' | 'ongoing';
export type CourseType = 'Essential' | 'Advanced' | 'Upper Quadrant';

export type Priority = 'high' | 'medium' | 'low';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Role =
  | 'admin'
  | 'coordinator'
  | 'instructor'
  | 'sales'
  | 'marketing'
  | 'accounting'
  | 'guest';

// Core entities
export interface Event {
  id: string;
  name: string;
  title?: string;
  city: string;
  state: string;
  instructorId?: string;
  instructorName?: string;
  enrolledStudents: number;
  instrumentsPurchased?: number;
  capacity: number;
  minViableEnrollment: number;
  type: CourseType;
  mode: EventMode;
  status: EventStatus;
  featuredImage?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  venueId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialties?: string[];
  certifications?: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StudentStatus = 'prospect' | 'enrolled' | 'completed' | 'no_show';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
  status?: StudentStatus;
  enrolledEventIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Venue {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  capacity?: number;
  timezone?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type RelatedType =
  | 'event'
  | 'campaign'
  | 'student'
  | 'instructor'
  | 'venue'
  | 'project'
  | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  assigneeRole?: Role;
  relatedType?: RelatedType;
  relatedId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationType = 'danger_zone' | 'reminder' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: Severity;
  message: string;
  read: boolean;
  targetRole?: Role;
  createdAt: string;
  meta?: Record<string, unknown>;
}

// Sales
export interface SalesMonthlyTrend {
  month: string;
  revenue: number;
  events: number;
  attendees: number;
}

export interface SalesCourseTypePerf {
  type: CourseType;
  revenue: number;
  events: number;
  averagePrice: number;
  attendees: number;
}

export interface RegionalPerformance {
  region: string;
  revenue: number;
  events: number;
  growth: number;
  marketPenetration: number;
}

export interface RevenueOpportunity {
  type: string;
  description: string;
  impact: string;
  priority: Priority;
  estimatedValue: number;
}

export interface SalesKPIs {
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  repeatCustomerRate: number;
  averageDealSize: number;
  salesCycleLength: number;
  leadConversionRate: number;
}

export interface SalesSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalEvents: number;
  eventsGrowth: number;
  averageAttendance: number;
  attendanceGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  monthlyTrends: SalesMonthlyTrend[];
  courseTypePerformance: SalesCourseTypePerf[];
  regionalPerformance: RegionalPerformance[];
  opportunities: RevenueOpportunity[];
  kpis: SalesKPIs;
}

// Marketing
export interface TargetingCriteria {
  geoRadius?: {
    centerLat: number;
    centerLng: number;
    radiusMiles: number;
  };
  courseTypes?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  priceRange?: { min: number; max: number };
  timeframe?: { startDate: string; endDate: string };
  excludeRecentAttendees?: boolean;
  minEngagementScore?: number;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  category: 'cold_outreach' | 'follow_up' | 'nurture' | 'upsell' | 'retention';
  channel: 'email' | 'sms' | 'linkedin' | 'phone_script';
  subject?: string;
  content: string;
  personalizationSlots: string[];
  complianceFlags: string[];
  tone: 'professional' | 'friendly' | 'urgent' | 'educational';
  targetAudience: string;
  expectedResponse: string;
  createdAt: string;
  updatedAt: string;
  usage: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
  };
}

export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface CampaignEvent {
  id: string;
  title: string;
  type: 'email' | 'social' | 'webinar' | 'ad' | 'other';
  status: 'planned' | 'in_progress' | 'scheduled' | 'sent' | 'paused';
  owner: string;
  startDate: string;
  endDate: string;
  description?: string;
  channels: string[];
  tags?: string[];
  contentLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignPerformance {
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
  status: CampaignStatus;
  targetAudience: string;
  creativeAssets: string[];
  landingPages: string[];
}

// Accounting
export interface AccountingSummary {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  grossMarginPercent: number;
  outstandingAR?: number;
  outstandingAP?: number;
  period?: string;
}