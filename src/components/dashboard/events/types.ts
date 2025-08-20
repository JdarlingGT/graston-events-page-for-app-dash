import { z } from 'zod';

export const eventStatusEnum = z.enum([
  'upcoming',
  'in_progress',
  'completed',
  'cancelled',
]);

export type EventStatus = z.infer<typeof eventStatusEnum>;

export const coreDetailsSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['workshop', 'seminar', 'certification']),
  price: z.number().min(0, 'Price must be 0 or greater'),
});

export const logisticsSchema = z.object({
  venueId: z.string().min(1, 'Venue is required'),
  instructorId: z.string().min(1, 'Instructor is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

export const scheduleSchema = z.object({
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  registrationDeadline: z.string().min(1, 'Registration deadline is required'),
  schedule: z.array(z.object({
    day: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    description: z.string(),
  })),
});

export const contentSchema = z.object({
  materials: z.array(z.string()),
  prerequisites: z.array(z.string()),
  objectives: z.array(z.string()),
});

export const eventFormSchema = z.object({
  coreDetails: coreDetailsSchema,
  logistics: logisticsSchema,
  schedule: scheduleSchema,
  content: contentSchema,
});

export type EventFormData = z.infer<typeof eventFormSchema>;
export type CoreDetailsData = z.infer<typeof coreDetailsSchema>;
export type LogisticsData = z.infer<typeof logisticsSchema>;
export type ScheduleData = z.infer<typeof scheduleSchema>;
export type ContentData = z.infer<typeof contentSchema>;

// Extended type for API responses
export interface EventData extends EventFormData {
  id: string;
  status: EventStatus;
  enrolled: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}