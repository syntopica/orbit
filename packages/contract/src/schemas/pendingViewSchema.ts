import { z } from 'zod'

export const pendingViewSchema = z.object({
  now: z.number(),
  sources: z
    .array(
      z.object({
        id: z.string().min(1),
        kind: z.enum(['todo', 'brain', 'worker', 'clips']),
        name: z.string().min(1),
        status: z.enum(['ok', 'unreadable', 'too_large', 'unavailable']),
        count: z.number().int().nonnegative(),
      }),
    )
    .max(53),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        source: z.string().min(1),
        kind: z.enum(['todo', 'brain', 'worker', 'clips']),
        state: z.enum([
          'open',
          'partial',
          'blocked',
          'issue',
          'failed',
          'waiting',
        ]),
        title: z.string().max(300),
        detail: z.string().max(4000),
        section: z.string().nullable(),
        ref: z.union([
          z.object({ file: z.string(), line: z.number().int().positive() }),
          z.string(),
        ]),
        ageMs: z.number().nonnegative().nullable(),
      }),
    )
    .max(2000),
})
