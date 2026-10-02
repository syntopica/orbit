import { z } from 'zod'

export const calendarEntrySchema = z.object({
  Minute: z.number().optional(),
  Hour: z.number().optional(),
  Day: z.number().optional(),
  Weekday: z.number().optional(),
  Month: z.number().optional(),
})
