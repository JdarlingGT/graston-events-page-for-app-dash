import { z } from 'zod';

/**
 * Centralized Zod validation schemas for domain models.
 * Mirrors TypeScript interfaces in '@/types/domain'.
 *
 * Usage:
 *  - Parse and validate:
 *      const data = EventSchema.parse(input)
 *  - Safe parse:
 *      const res = EventSchema.safeParse(input)
 *  - Infer TS type from schema:
 *      type Event = z.infer<typeof EventSchema>
 */

// Shared primitive enums
export const EventModeSchema = z.enum(['In-Person', 'Virtual', 'Hybrid']);
export const EventStatusSchema = z.enum(['upcoming', 'cancelled', 'completed', 'ongoing']);
export const CourseTypeSchema = z.enum(['Essential', 'Advanced', 'Upper Quadrant']);

export const PrioritySchema = z.enum(['high', 'medium', 'low']);
export const SeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const RoleSchema = z.enum([
  'admin',
  'coordinator',
  'instructor',
  'sales',
  'marketing',
  'accounting',
  'guest',
]);

// Event
export const EventSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  instructorId: z.string().optional(),
  instructorName: z.string().optional(),
  enrolledStudents: z.number().int().nonnegative(),
  instrumentsPurchased: z.number().int().nonnegative().optional(),
  capacity: z.number().int().positive(),
  minViableEnrollment: z.number().int().nonnegative(),
  type: CourseTypeSchema,
  mode: EventModeSchema,
  status: EventStatusSchema,
  featuredImage: z.string().url().optional(),
  date: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  venueId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Instructor
export const InstructorSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  active: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Student
export const StudentStatusSchema = z.enum(['prospect', 'enrolled', 'completed', 'no_show']);

export const StudentSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  tags: z.array(z.string()).default([]).optional(),
  status: StudentStatusSchema.optional(),
  enrolledEventIds: z.array(z.string()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Venue
export const VenueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  capacity: z.number().int().nonnegative().optional(),
  timezone: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Tasks
export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done', 'blocked']);
export const RelatedTypeSchema = z.enum([
  'event',
  'campaign',
  'student',
  'instructor',
  'venue',
  'project',
  'other',
]);

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: TaskStatusSchema,
  dueDate: z.string().datetime().optional(),
  assigneeRole: RoleSchema.optional(),
  relatedType: RelatedTypeSchema.optional(),
  relatedId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Notifications
export const NotificationTypeSchema = z.enum(['danger_zone', 'reminder', 'info', 'warning']);

export const NotificationSchema = z.object({
  id: z.string().min(1),
  type: NotificationTypeSchema,
  severity: SeveritySchema,
  message: z.string().min(1),
  read: z.boolean(),
  targetRole: RoleSchema.optional(),
  createdAt: z.string().datetime(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

// Sales
export const SalesMonthlyTrendSchema = z.object({
  month: z.string().min(1),
  revenue: z.number().nonnegative(),
  events: z.number().int().nonnegative(),
  attendees: z.number().int().nonnegative(),
});

export const SalesCourseTypePerfSchema = z.object({
  type: CourseTypeSchema,
  revenue: z.number().nonnegative(),
  events: z.number().int().nonnegative(),
  averagePrice: z.number().nonnegative(),
  attendees: z.number().int().nonnegative(),
});

export const RegionalPerformanceSchema = z.object({
  region: z.string().min(1),
  revenue: z.number().nonnegative(),
  events: z.number().int().nonnegative(),
  growth: z.number(), // may be negative
  marketPenetration: z.number().min(0).max(100),
});

export const RevenueOpportunitySchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  impact: z.string().min(1),
  priority: PrioritySchema,
  estimatedValue: z.number().nonnegative(),
});

export const SalesKPIsSchema = z.object({
  customerLifetimeValue: z.number().nonnegative(),
  customerAcquisitionCost: z.number().nonnegative(),
  repeatCustomerRate: z.number().min(0).max(100),
  averageDealSize: z.number().nonnegative(),
  salesCycleLength: z.number().nonnegative(),
  leadConversionRate: z.number().min(0).max(100),
});

export const SalesSummarySchema = z.object({
  totalRevenue: z.number().nonnegative(),
  revenueGrowth: z.number(), // can be negative
  totalEvents: z.number().int().nonnegative(),
  eventsGrowth: z.number(),
  averageAttendance: z.number().nonnegative(),
  attendanceGrowth: z.number(),
  conversionRate: z.number().min(0).max(100),
  conversionGrowth: z.number(),
  monthlyTrends: z.array(SalesMonthlyTrendSchema),
  courseTypePerformance: z.array(SalesCourseTypePerfSchema),
  regionalPerformance: z.array(RegionalPerformanceSchema),
  opportunities: z.array(RevenueOpportunitySchema),
  kpis: SalesKPIsSchema,
});

// Marketing - Targeting
export const GeoRadiusSchema = z.object({
  centerLat: z.number().min(-90).max(90),
  centerLng: z.number().min(-180).max(180),
  radiusMiles: z.number().positive(),
});

export const TargetingCriteriaSchema = z.object({
  geoRadius: GeoRadiusSchema.optional(),
  courseTypes: z.array(z.string()).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .refine((v) => v.max >= v.min, { message: 'max must be greater than or equal to min' })
    .optional(),
  timeframe: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .refine((v) => new Date(v.endDate) >= new Date(v.startDate), {
      message: 'endDate must be after startDate',
    })
    .optional(),
  excludeRecentAttendees: z.boolean().optional(),
  minEngagementScore: z.number().min(0).max(100).optional(),
});

// Marketing - Outreach
export const OutreachTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['cold_outreach', 'follow_up', 'nurture', 'upsell', 'retention']),
  channel: z.enum(['email', 'sms', 'linkedin', 'phone_script']),
  subject: z.string().optional(),
  content: z.string().min(1),
  personalizationSlots: z.array(z.string()).default([]),
  complianceFlags: z.array(z.string()).default([]),
  tone: z.enum(['professional', 'friendly', 'urgent', 'educational']),
  targetAudience: z.string().min(1),
  expectedResponse: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  usage: z.object({
    sent: z.number().int().nonnegative(),
    opened: z.number().int().nonnegative(),
    clicked: z.number().int().nonnegative(),
    replied: z.number().int().nonnegative(),
    converted: z.number().int().nonnegative(),
  }),
});

// Marketing - Campaigns
export const CampaignStatusSchema = z.enum(['active', 'paused', 'completed']);

export const CampaignEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['email', 'social', 'webinar', 'ad', 'other']),
  status: z.enum(['planned', 'in_progress', 'scheduled', 'sent', 'paused']),
  owner: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  description: z.string().optional(),
  channels: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]).optional(),
  contentLink: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CampaignPerformanceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  channel: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().nonnegative(),
  spent: z.number().nonnegative(),
  impressions: z.number().int().nonnegative(),
  clicks: z.number().int().nonnegative(),
  ctr: z.number().min(0),
  conversions: z.number().int().nonnegative(),
  conversionRate: z.number().min(0).max(100),
  revenue: z.number().nonnegative(),
  roas: z.number().min(0),
  cpa: z.number().nonnegative(),
  status: CampaignStatusSchema,
  targetAudience: z.string().min(1),
  creativeAssets: z.array(z.string()).default([]),
  landingPages: z.array(z.string()).default([]),
});

// Accounting
export const AccountingSummarySchema = z.object({
  totalRevenue: z.number().nonnegative(),
  totalExpenses: z.number().nonnegative(),
  grossProfit: z.number(), // can be negative if expenses exceed revenue
  grossMarginPercent: z.number().min(-100).max(100),
  outstandingAR: z.number().nonnegative().optional(),
  outstandingAP: z.number().nonnegative().optional(),
  period: z.string().optional(),
});

// Utility schema helpers
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(500).default(25),
});

export const DateRangeQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
}).refine((v) => new Date(v.to) >= new Date(v.from), { message: 'to must be after from' });

// Export inferred TS types (optional convenience)
export type Event = z.infer<typeof EventSchema>;
export type Instructor = z.infer<typeof InstructorSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Venue = z.infer<typeof VenueSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type SalesSummary = z.infer<typeof SalesSummarySchema>;
export type TargetingCriteria = z.infer<typeof TargetingCriteriaSchema>;
export type OutreachTemplate = z.infer<typeof OutreachTemplateSchema>;
export type CampaignEvent = z.infer<typeof CampaignEventSchema>;
export type CampaignPerformance = z.infer<typeof CampaignPerformanceSchema>;
export type AccountingSummary = z.infer<typeof AccountingSummarySchema>;