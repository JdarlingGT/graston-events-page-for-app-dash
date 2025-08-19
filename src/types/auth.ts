export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfile;
}

export type UserRole = 'admin' | 'instructor' | 'staff' | 'viewer';

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  timezone: string;
  preferences: UserPreferences;
  instructorProfile?: InstructorProfile;
}

export interface InstructorProfile {
  instructorId: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  isVerified: boolean;
  canTeachCourses: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  eventReminders: boolean;
  studentUpdates: boolean;
  systemAlerts: boolean;
}

export interface DashboardPreferences {
  defaultView: 'calendar' | 'list' | 'grid';
  showMetrics: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'instructors:manage',
    'events:manage',
    'students:manage',
    'venues:manage',
    'reports:view',
    'settings:manage',
    'users:manage',
    'system:admin'
  ],
  instructor: [
    'events:read',
    'events:update_own',
    'students:read',
    'students:update_roster',
    'training:manage_workspace',
    'resources:read',
    'resources:upload_own',
    'profile:update_own'
  ],
  staff: [
    'events:read',
    'students:read',
    'instructors:read',
    'venues:read',
    'reports:view_limited'
  ],
  viewer: [
    'events:read',
    'instructors:read',
    'venues:read'
  ]
};

// Authentication session
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  permissions: string[];
}

// Login/Registration types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  inviteToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

// OAuth providers
export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
  clientId: string;
  scopes: string[];
}

export interface OAuthCallback {
  provider: string;
  code: string;
  state: string;
}

// API Authentication
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  permissions: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

// JWT Token payload
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
}

// Route protection
export interface RoutePermission {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  permissions: string[];
  allowSelf?: boolean; // Allow users to access their own resources
}

// Middleware types
export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: string[];
  allowSelf?: boolean;
}

export interface AuthContext {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  refreshToken: () => Promise<AuthSession>;
  updateProfile: (data: Partial<UserProfile>) => Promise<User>;
}

// Error types
export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  USER_INACTIVE: 'user_inactive',
  USER_SUSPENDED: 'user_suspended',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  ACCOUNT_LOCKED: 'account_locked',
  EMAIL_NOT_VERIFIED: 'email_not_verified',
  PASSWORD_TOO_WEAK: 'password_too_weak',
  EMAIL_ALREADY_EXISTS: 'email_already_exists'
} as const;

// Audit logging
export interface AuthAuditLog {
  id: string;
  userId?: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorCode?: string;
}

// Security settings
export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  requireMFA: boolean;
  allowedDomains?: string[];
  ipWhitelist?: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // number of previous passwords to check
  maxAge: number; // days before password expires
}

// Multi-factor authentication
export interface MFASetup {
  userId: string;
  method: 'totp' | 'sms' | 'email';
  secret?: string;
  backupCodes: string[];
  isEnabled: boolean;
  verifiedAt?: Date;
}

export interface MFAChallenge {
  userId: string;
  method: 'totp' | 'sms' | 'email';
  code: string;
  expiresAt: Date;
}

// Invitation system
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  permissions?: string[];
}