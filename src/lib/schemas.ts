import { z } from 'zod';

// Instructor
export const instructorSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "Valid email is required." }),
  phone: z.string().optional(),
  bio: z.string().min(5, { message: "Bio is required." }),
  specialties: z.string().min(2, { message: "Specialties are required." }),
});
export type InstructorFormValues = z.infer<typeof instructorSchema>;

// Venue
export const venueSchema = z.object({
  name: z.string().min(2, { message: "Venue name is required." }),
  type: z.string().min(2, { message: "Venue type is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  contactPerson: z.string().min(2, { message: "Contact person is required." }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required." }),
});
export type VenueFormValues = z.infer<typeof venueSchema>;

// Event
export const eventSchema = z.object({
  title: z.string().min(2, { message: "Event title is required." }),
  status: z.enum(["Go", "At Risk", "Completed"]),
  startDate: z.string().min(2, { message: "Start date is required." }),
  endDate: z.string().min(2, { message: "End date is required." }),
  location: z.object({
    city: z.string().min(2, { message: "City is required." }),
    state: z.string().min(2, { message: "State is required." }),
    venueId: z.string().nullable(),
  }),
  courseType: z.string().min(2, { message: "Course type is required." }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required." }),
  enrolledCount: z.coerce.number().optional(),
  revenue: z.coerce.number().optional(),
  instructorIds: z.array(z.string()).optional(),
});
export type EventFormValues = z.infer<typeof eventSchema>;

// Task
export const taskSchema = z.object({
  title: z.string().min(2, { message: "Task title is required." }),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional(),
  assigneeName: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});
export type TaskFormValues = z.infer<typeof taskSchema>;

// Project
export const projectSchema = z.object({
  name: z.string().min(5, { message: "Project name must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  memberAvatars: z.array(z.string()).optional(),
  memberEmails: z.array(z.string().email()).min(1, { message: "At least one team member email is required." }),
});
export type ProjectFormValues = z.infer<typeof projectSchema>;