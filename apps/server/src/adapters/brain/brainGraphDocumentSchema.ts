import { z } from 'zod'

// `brain graph --json --no-html` (brain bf94e87): writes nothing, no titles.
export const brainGraphDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      degree: z.number().int().nonnegative(),
    }),
  ),
  edges: z.array(z.object({ source: z.string(), target: z.string() })),
  orphans: z.array(z.string()),
  dangling: z.array(z.object({ page: z.string(), target: z.string() })),
})
