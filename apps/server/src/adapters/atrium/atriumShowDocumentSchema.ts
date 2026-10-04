import { z } from 'zod'

// `atrium synthesis show --json --job-key K`: only `content` is read, and
// it is content (spec 6.6), forwarded in one response and never kept.
export const atriumShowDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  content: z.object({
    title: z.string(),
    summary: z.string(),
    facts: z.array(z.string()),
    openEnds: z.array(z.string()),
  }),
})
