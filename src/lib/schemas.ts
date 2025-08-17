import { z } from 'zod';

// Schema for creating/updating a venue
export const venueSchema = z.object({
  name: z.string().min(3, { message: "Venue name must be at least 3 characters long." }),
  type: z.string().min(3, { message: "Venue type is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  contactPerson: z.string().min(3, { message: "Contact person is required." }),
  capacity: z.coerce.number().int().min(0, { message: "Capacity must be a positive number." }),
});
export type VenueFormValues = z.infer<typeof venueSchema>;

// Schema for creating/updating an instructor
export const instructorSchema = z.object({
  name: z.string().min(3, { message: "Instructor name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  phone: z.string().optional(),
  specialties: z.string().min(3, { message: "Specialties are required." }),
});
export type InstructorFormValues = z.infer<typeof instructorSchema>;

// Schema for creating/updating an event
export const eventSchema = z.object({
  title: z.string().min(10, { message: "Title must be at least 10 characters." }),
  status: z.enum(["Go", "At Risk", "Completed"]),
  startDate: z.string(),
  endDate: z.string(),
  location: z.object({
    city: z.string().min(2),
    state: z.string().min(2),
    venueId: z.string().nullable(),
  }),
  courseType: z.string().min(3),
  capacity: z.coerce.number().int().min(1),
  enrolledCount: z.coerce.number().int().min(0),
  revenue: z.coerce.number().min(0),
  instructorIds: z.array(z.string()).min(1),
});
export type EventFormValues = z.infer<typeof eventSchema>;

// Schema for task attachments from Google Drive
export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  iconUrl: z.string().url(),
});

// Schema for creating/updating a task
export const taskSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional(),
  assigneeName: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});
export type TaskFormValues = z.infer<typeof taskSchema>;