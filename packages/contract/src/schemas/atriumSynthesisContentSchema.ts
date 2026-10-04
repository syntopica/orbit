import { z } from 'zod'

// GET /api/atrium/syntheses/:jobKey/content: one record's synthesized text.
// Content (spec 6.6): only in this response, behind the reveal header.
export const atriumSynthesisContentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  facts: z.array(z.string()),
  openEnds: z.array(z.string()),
})
