import { z } from 'zod';

// Base instructor schema
export const instructorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be less than 1000 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export const instructorUpdateSchema = instructorSchema.partial();

// Certification schema
export const certificationSchema = z.object({
  name: z.string().min(2, 'Certification name is required'),
  issuingOrganization: z.string().min(2, 'Issuing organization is required'),
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid issue date'),
  expiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid expiry date').optional(),
  certificateUrl: z.string().url('Invalid certificate URL').optional(),
  verified: z.boolean().default(false),
});

// Resource schema
export const instructorResourceSchema = z.object({
  name: z.string().min(2, 'Resource name is required'),
  type: z.enum(['document', 'video', 'image', 'link']),
  url: z.string().url('Invalid URL').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  isPublic: z.boolean().default(false),
});

// Availability schema
export const dayAvailabilitySchema = z.object({
  available: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)').optional(),
  breaks: z.array(z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  })).default([]),
});

export const availabilityScheduleSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  weeklySchedule: z.object({
    monday: dayAvailabilitySchema,
    tuesday: dayAvailabilitySchema,
    wednesday: dayAvailabilitySchema,
    thursday: dayAvailabilitySchema,
    friday: dayAvailabilitySchema,
    saturday: dayAvailabilitySchema,
    sunday: dayAvailabilitySchema,
  }),
  blackoutDates: z.array(z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    reason: z.string().optional(),
  })).default([]),
  preferredLocations: z.array(z.string()).default([]),
  maxEventsPerMonth: z.number().int().min(1).max(31).default(10),
});

// Skills evaluation schema
export const evaluationCriteriaSchema = z.object({
  name: z.string().min(1, 'Criteria name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  maxScore: z.number().int().min(1).max(100),
  actualScore: z.number().int().min(0),
  passingScore: z.number().int().min(1),
  notes: z.string().optional(),
  demonstrated: z.boolean(),
});

export const skillsEvaluationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  criteria: z.array(evaluationCriteriaSchema).min(1, 'At least one evaluation criteria is required'),
  overallStatus: z.enum(['not-started', 'passed', 'needs-review']),
  instructorNotes: z.string().max(1000, 'Notes must be less than 1000 characters').default(''),
  retakeRequired: z.boolean().default(false),
  digitalSignature: z.string().optional(),
  witnessSignature: z.string().optional(),
});

// Training session schema
export const sessionLocationSchema = z.object({
  venueId: z.string().optional(),
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code is required'),
  room: z.string().optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  amenities: z.array(z.string()).default([]),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
});

export const studentEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  enrollmentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid enrollment date'),
  status: z.enum(['enrolled', 'attended', 'completed', 'dropped']).default('enrolled'),
  preCourseProgress: z.number().min(0).max(100).default(0),
  licenseType: z.string().min(1, 'License type is required'),
  specialRequirements: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Invalid email').optional(),
  }).optional(),
});

export const trainingSessionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start time'),
  endTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end time'),
  location: sessionLocationSchema,
  courseType: z.string().min(1, 'Course type is required'),
  maxCapacity: z.number().int().min(1, 'Max capacity must be at least 1'),
  sessionNotes: z.string().max(2000, 'Session notes must be less than 2000 characters').default(''),
  completionStatus: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
});

// Attendance schema
export const attendanceRecordSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  checkInTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid check-in time').optional(),
  checkOutTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid check-out time').optional(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  markedBy: z.string().min(1, 'Marked by is required'),
});

// Final roster submission schema
export const studentResultSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  attendance: z.boolean(),
  skillsCheck: z.enum(['passed', 'needs-review', 'not-started']),
  certificateIssued: z.boolean().default(false),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').default(''),
  requiresFollowUp: z.boolean().default(false),
});

export const finalRosterSubmissionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  instructorId: z.string().min(1, 'Instructor ID is required'),
  studentResults: z.array(studentResultSchema).min(1, 'At least one student result is required'),
  overallNotes: z.string().max(2000, 'Overall notes must be less than 2000 characters').default(''),
  followUpRequired: z.array(z.string()).default([]),
});

// Filter schemas
export const instructorFiltersSchema = z.object({
  search: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  status: z.array(z.enum(['active', 'inactive', 'pending'])).optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
  location: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['name', 'rating', 'experience', 'recent']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Bulk operations schema
export const bulkInstructorOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete', 'assign_specialty', 'remove_specialty']),
  instructorIds: z.array(z.string()).min(1, 'At least one instructor must be selected'),
  data: z.record(z.any()).optional(), // Additional data for specific operations
});

// Import/Export schemas
export const instructorImportSchema = z.object({
  instructors: z.array(instructorSchema),
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
});

export const instructorExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
  fields: z.array(z.string()).optional(),
  filters: instructorFiltersSchema.optional(),
});

// Performance metrics schema
export const performanceDataSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid event date'),
  studentsEnrolled: z.number().int().min(0),
  studentsCompleted: z.number().int().min(0),
  averageRating: z.number().min(0).max(5),
  feedback: z.array(z.string()).default([]),
});

export const instructorMetricsSchema = z.object({
  instructorId: z.string().min(1, 'Instructor ID is required'),
  totalEventsInstructed: z.number().int().min(0).default(0),
  totalStudentsTrained: z.number().int().min(0).default(0),
  averageStudentRating: z.number().min(0).max(5).default(0),
  completionRate: z.number().min(0).max(100).default(0),
  averageClassSize: z.number().min(0).default(0),
  recentPerformance: z.array(performanceDataSchema).default([]),
});

// Type exports
export type InstructorFormData = z.infer<typeof instructorSchema>;
export type InstructorUpdateData = z.infer<typeof instructorUpdateSchema>;
export type CertificationFormData = z.infer<typeof certificationSchema>;
export type InstructorResourceFormData = z.infer<typeof instructorResourceSchema>;
export type AvailabilityScheduleFormData = z.infer<typeof availabilityScheduleSchema>;
export type SkillsEvaluationFormData = z.infer<typeof skillsEvaluationSchema>;
export type TrainingSessionFormData = z.infer<typeof trainingSessionSchema>;
export type AttendanceRecordFormData = z.infer<typeof attendanceRecordSchema>;
export type FinalRosterSubmissionFormData = z.infer<typeof finalRosterSubmissionSchema>;
export type InstructorFiltersData = z.infer<typeof instructorFiltersSchema>;
export type BulkInstructorOperationData = z.infer<typeof bulkInstructorOperationSchema>;
export type InstructorImportData = z.infer<typeof instructorImportSchema>;
export type InstructorExportData = z.infer<typeof instructorExportSchema>;
export type InstructorMetricsData = z.infer<typeof instructorMetricsSchema>;