import { z } from 'zod'

// `brain page --json --id <id>`: the page (exit 0) or a fixed error (exit 1).
export const brainPageDocumentSchema = z.union([
  z.object({
    schemaVersion: z.literal(1),
    error: z.enum(['page_not_found', 'invalid_page_id']),
  }),
  z.object({
    schemaVersion: z.literal(1),
    id: z.string(),
    frontmatter: z.record(z.string(), z.unknown()),
    body: z.string(),
    truncated: z.boolean(),
    links: z.object({
      outbound: z.array(z.object({ target: z.string(), exists: z.boolean() })),
      inbound: z.array(z.string()),
    }),
  }),
])
