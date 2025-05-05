import { z } from "zod";

export const CreateEventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startTime: z.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future",
  }),
  endTime: z.date().refine((date: Date) => {
    return date > new Date();
  }, {
    message: "End time must be in the future"
  }),
  isTokenGated: z.boolean().optional().default(false),
  location: z.string()
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});
