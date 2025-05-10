import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  isTokenGated: z.boolean().default(false),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
});


export const joinEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

