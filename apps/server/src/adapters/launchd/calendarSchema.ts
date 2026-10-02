import { z } from 'zod'

import { calendarEntrySchema } from './calendarEntrySchema'

export const calendarSchema = z.union([
  calendarEntrySchema,
  z.array(calendarEntrySchema).min(1),
])
