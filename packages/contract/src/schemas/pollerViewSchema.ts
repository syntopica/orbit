import { z } from 'zod'

import { pollerRowSchema } from './pollerRowSchema'

export const pollerViewSchema = z.object({
  now: z.number(),
  rows: z.array(pollerRowSchema).max(100),
})
