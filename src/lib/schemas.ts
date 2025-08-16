import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(3, { message: "Venue name must be at least 3 characters long." }),
  type: z.string().min(3, { message: "Venue type is required." }),
  city: z.string().min(2, { message: "City is required." }),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1." }),
});

export type VenueFormValues = z.infer<typeof venueSchema>;