import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'instructor', 'staff', 'viewer']);

// User preferences schema
export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  eventReminders: z.boolean().default(true),
  studentUpdates: z.boolean().default(true),
  systemAlerts: z.boolean().default(true),
});

export const dashboardPreferencesSchema = z.object({
  defaultView: z.enum(['calendar', 'list', 'grid']).default('list'),
  showMetrics: z.boolean().default(true),
  compactMode: z.boolean().default(false),
  autoRefresh: z.boolean().default(true),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  notifications: notificationPreferencesSchema.default(() => ({
    email: true,
    push: false,
    sms: false,
    eventReminders: true,
    studentUpdates: true,
    systemAlerts: true,
  })),
  dashboard: dashboardPreferencesSchema.default(() => ({
    defaultView: 'grid' as const,
    showMetrics: true,
    compactMode: false,
    autoRefresh: true,
  })),
});

// User profile schema
export const instructorProfileSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  certifications: z.array(z.string()).default([]),
  isVerified: z.boolean().default(false),
  canTeachCourses: z.array(z.string()).default([]),
});

export const userProfileSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  timezone: z.string().min(1, 'Timezone is required').default('America/New_York'),
  preferences: userPreferencesSchema.default(() => ({
    theme: 'system' as const,
    language: 'en',
    notifications: {
      email: true,
      push: false,
      sms: false,
      eventReminders: true,
      studentUpdates: true,
      systemAlerts: true,
    },
    dashboard: {
      defaultView: 'grid' as const,
      showMetrics: true,
      compactMode: false,
      autoRefresh: true,
    },
  })),
  instructorProfile: instructorProfileSchema.optional(),
});

// Base user schema
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  role: userRoleSchema.default('viewer'),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).default('active'),
  profile: userProfileSchema.default(() => ({
    timezone: 'America/New_York',
    preferences: {
      theme: 'system' as const,
      language: 'en',
      notifications: {
        email: true,
        push: false,
        sms: false,
        eventReminders: true,
        studentUpdates: true,
        systemAlerts: true,
      },
      dashboard: {
        defaultView: 'grid' as const,
        showMetrics: true,
        compactMode: false,
        autoRefresh: true,
      },
    },
  })),
});

export const userUpdateSchema = userSchema.partial();

// Authentication schemas
export const loginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false),
});

export const registerDataSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  role: userRoleSchema.optional(),
  inviteToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Permission schemas
export const permissionConditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['equals', 'not_equals', 'in', 'not_in', 'contains']),
  value: z.any(),
});

export const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  resource: z.string().min(1, 'Resource is required'),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage']),
  conditions: z.array(permissionConditionSchema).optional(),
});

// OAuth schemas
export const oauthProviderSchema = z.object({
  id: z.string().min(1, 'Provider ID is required'),
  name: z.string().min(1, 'Provider name is required'),
  enabled: z.boolean().default(true),
  clientId: z.string().min(1, 'Client ID is required'),
  scopes: z.array(z.string()).default([]),
});

export const oauthCallbackSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

// API Key schemas
export const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name must be less than 100 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  expiresAt: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid expiry date').optional(),
});

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'Name must be less than 100 characters').optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required').optional(),
  isActive: z.boolean().optional(),
});

// MFA schemas
export const mfaSetupSchema = z.object({
  method: z.enum(['totp', 'sms', 'email']),
  secret: z.string().optional(),
});

export const mfaChallengeSchema = z.object({
  method: z.enum(['totp', 'sms', 'email']),
  code: z.string().min(6, 'Code must be at least 6 characters').max(8, 'Code must be at most 8 characters'),
});

// Invitation schemas
export const userInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: userRoleSchema,
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid expiry date').optional(),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Security settings schemas
export const passwordPolicySchema = z.object({
  minLength: z.number().int().min(8).max(128).default(8),
  requireUppercase: z.boolean().default(true),
  requireLowercase: z.boolean().default(true),
  requireNumbers: z.boolean().default(true),
  requireSpecialChars: z.boolean().default(true),
  preventReuse: z.number().int().min(0).max(24).default(5),
  maxAge: z.number().int().min(30).max(365).default(90),
});

export const securitySettingsSchema = z.object({
  passwordPolicy: passwordPolicySchema.default(() => ({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    maxAge: 90,
  })),
  sessionTimeout: z.number().int().min(15).max(1440).default(480), // minutes
  maxLoginAttempts: z.number().int().min(3).max(10).default(5),
  lockoutDuration: z.number().int().min(5).max(60).default(15), // minutes
  requireMFA: z.boolean().default(false),
  allowedDomains: z.array(z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format')).optional(),
  ipWhitelist: z.array(z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address')).optional(),
});

// Audit log schemas
export const authAuditLogSchema = z.object({
  userId: z.string().optional(),
  action: z.string().min(1, 'Action is required'),
  resource: z.string().optional(),
  details: z.record(z.string(), z.any()).default({}),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address'),
  userAgent: z.string().min(1, 'User agent is required'),
  success: z.boolean(),
  errorCode: z.string().optional(),
});

// Filter schemas
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  roles: z.array(userRoleSchema).optional(),
  status: z.array(z.enum(['active', 'inactive', 'pending', 'suspended'])).optional(),
  lastLoginBefore: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  lastLoginAfter: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  createdBefore: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  createdAfter: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'lastLogin', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const auditLogFiltersSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  success: z.boolean().optional(),
  ipAddress: z.string().optional(),
  dateFrom: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  dateTo: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  sortBy: z.enum(['timestamp', 'action', 'userId', 'success']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

// Bulk operations schemas
export const bulkUserOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'suspend', 'delete', 'change_role', 'reset_password']),
  userIds: z.array(z.string()).min(1, 'At least one user must be selected'),
  data: z.record(z.string(), z.any()).optional(), // Additional data for specific operations
});

// Type exports
export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type LoginCredentialsData = z.infer<typeof loginCredentialsSchema>;
export type RegisterData = z.infer<typeof registerDataSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type PermissionData = z.infer<typeof permissionSchema>;
export type OAuthProviderData = z.infer<typeof oauthProviderSchema>;
export type OAuthCallbackData = z.infer<typeof oauthCallbackSchema>;
export type ApiKeyData = z.infer<typeof apiKeySchema>;
export type ApiKeyUpdateData = z.infer<typeof apiKeyUpdateSchema>;
export type MFASetupData = z.infer<typeof mfaSetupSchema>;
export type MFAChallengeData = z.infer<typeof mfaChallengeSchema>;
export type UserInvitationData = z.infer<typeof userInvitationSchema>;
export type AcceptInvitationData = z.infer<typeof acceptInvitationSchema>;
export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>;
export type AuthAuditLogData = z.infer<typeof authAuditLogSchema>;
export type UserFiltersData = z.infer<typeof userFiltersSchema>;
export type AuditLogFiltersData = z.infer<typeof auditLogFiltersSchema>;
export type BulkUserOperationData = z.infer<typeof bulkUserOperationSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;