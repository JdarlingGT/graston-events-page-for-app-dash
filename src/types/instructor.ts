export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio: string;
  avatar?: string;
  specialties: string[];
  certifications: Certification[];
  teachingHistory: TrainingSession[];
  resources: InstructorResource[];
  availability: AvailabilitySchedule;
  performanceMetrics: InstructorMetrics;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  verified: boolean;
}

export interface InstructorResource {
  id: string;
  instructorId: string;
  name: string;
  type: 'document' | 'video' | 'image' | 'link';
  url: string;
  description?: string;
  category: string;
  isPublic: boolean;
  uploadedAt: Date;
  fileSize?: number;
  version: number;
}

export interface AvailabilitySchedule {
  id: string;
  instructorId: string;
  timezone: string;
  weeklySchedule: WeeklyAvailability;
  blackoutDates: DateRange[];
  preferredLocations: string[];
  maxEventsPerMonth: number;
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  available: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  breaks: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface InstructorMetrics {
  id: string;
  instructorId: string;
  totalEventsInstructed: number;
  totalStudentsTrained: number;
  averageStudentRating: number;
  completionRate: number; // Percentage of students who pass
  averageClassSize: number;
  recentPerformance: PerformanceData[];
  lastUpdated: Date;
}

export interface PerformanceData {
  eventId: string;
  eventDate: Date;
  studentsEnrolled: number;
  studentsCompleted: number;
  averageRating: number;
  feedback: string[];
}

export interface TrainingSession {
  id: string;
  eventId: string;
  instructorId: string;
  students: StudentEnrollment[];
  skillsEvaluations: SkillsEvaluation[];
  resources: SessionResource[];
  attendance: AttendanceRecord[];
  finalRoster?: FinalRosterSubmission;
  sessionNotes: string;
  completionStatus: 'pending' | 'in-progress' | 'completed';
  startTime: Date;
  endTime: Date;
  location: SessionLocation;
  courseType: string;
  maxCapacity: number;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  sessionId: string;
  enrollmentDate: Date;
  status: 'enrolled' | 'attended' | 'completed' | 'dropped';
  preCourseProgress: number;
  licenseType: string;
  specialRequirements?: string[];
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface SkillsEvaluation {
  id: string;
  studentId: string;
  sessionId: string;
  instructorId: string;
  criteria: EvaluationCriteria[];
  overallStatus: 'not-started' | 'passed' | 'needs-review';
  instructorNotes: string;
  evaluationDate: Date;
  retakeRequired: boolean;
  retakeCount: number;
  digitalSignature?: string;
  witnessSignature?: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  category: string;
  maxScore: number;
  actualScore: number;
  passingScore: number;
  notes?: string;
  demonstrated: boolean;
}

export interface SessionResource {
  id: string;
  sessionId: string;
  resourceId: string;
  name: string;
  type: 'manual' | 'checklist' | 'video' | 'document';
  url: string;
  downloadCount: number;
  lastAccessed?: Date;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  markedBy: string; // instructor ID
  markedAt: Date;
}

export interface FinalRosterSubmission {
  id: string;
  sessionId: string;
  instructorId: string;
  submittedAt: Date;
  studentResults: StudentResult[];
  overallNotes: string;
  certificatesGenerated: number;
  followUpRequired: string[];
}

export interface StudentResult {
  studentId: string;
  attendance: boolean;
  skillsCheck: 'passed' | 'needs-review' | 'not-started';
  certificateIssued: boolean;
  notes: string;
  requiresFollowUp: boolean;
}

export interface SessionLocation {
  venueId?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  room?: string;
  capacity: number;
  amenities: string[];
  contactPerson?: string;
  contactPhone?: string;
}

// Form validation types
export interface InstructorFormData {
  name: string;
  email: string;
  phone?: string;
  bio: string;
  specialties: string[];
  avatar?: File;
}

export interface CertificationFormData {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateFile?: File;
}

export interface ResourceFormData {
  name: string;
  type: 'document' | 'video' | 'image' | 'link';
  file?: File;
  url?: string;
  description?: string;
  category: string;
  isPublic: boolean;
}

// API Response types
export interface InstructorListResponse {
  instructors: Instructor[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface InstructorDetailResponse {
  instructor: Instructor;
  recentSessions: TrainingSession[];
  upcomingSessions: TrainingSession[];
  performanceTrends: PerformanceData[];
}

// Filter and search types
export interface InstructorFilters {
  search?: string;
  specialties?: string[];
  status?: ('active' | 'inactive' | 'pending')[];
  availability?: 'available' | 'busy' | 'unavailable';
  location?: string;
  certifications?: string[];
  rating?: number;
  sortBy?: 'name' | 'rating' | 'experience' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export interface InstructorStats {
  totalInstructors: number;
  activeInstructors: number;
  averageRating: number;
  totalSessionsThisMonth: number;
  topPerformers: Instructor[];
  recentlyAdded: Instructor[];
}