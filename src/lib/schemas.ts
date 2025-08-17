import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(3, { message: "Venue name must be at least 3 characters long." }),
  type: z.string().min(3, { message: "Venue type is required." }),
  city: z.string().min(2, { message: "City is required." }),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1." }),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

export const instructorSchema = z.object({
  name: z.string().min(3, { message: "Instructor name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  specialties: z.string().min(3, { message: "Please list at least one specialty." }),
});

export type InstructorFormValues = z.infer<typeof instructorSchema>;

export const eventSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters long." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  instructor: z.string().min(2, { message: "Instructor name is required." }),
  enrolledStudents: z.coerce.number().int().min(0, { message: "Enrolled students must be a non-negative number." }),
  instrumentsPurchased: z.coerce.number().int().min(0, { message: "Kits purchased must be a non-negative number." }),
  type: z.enum(["Essential", "Advanced"], { required_error: "You must select an event type." }),
  mode: z.enum(["In-Person", "Virtual"], { required_error: "You must select an event mode." }),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  iconUrl: z.string().url(),
});

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