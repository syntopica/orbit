import { z } from 'zod'

// zod 4 numbers refuse NaN and Infinity, so a diverged layout fails here.
export const layoutResultSchema = z.object({
  x: z.array(z.number()),
  y: z.array(z.number()),
  community: z.array(z.number().int()),
})
