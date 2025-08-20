import { z } from 'zod';

export const EventFormSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['Go', 'At Risk', 'Completed']),
  startDate: z.string(),
  endDate: z.string(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    venueId: z.string().nullable(),
  }),
  courseType: z.string(),
  capacity: z.number().int(),
  enrolledCount: z.number().int(),
  revenue: z.number(),
  instructorIds: z.array(z.string()),
  attachment: z.instanceof(File).optional(),
});

export type EventFormValues = z.infer<typeof EventFormSchema>;