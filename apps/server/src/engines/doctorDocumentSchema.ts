import { z } from 'zod'

export const doctorDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  ok: z.boolean(),
  checks: z.array(
    z.object({ name: z.string(), ok: z.boolean(), code: z.string() }),
  ),
})
