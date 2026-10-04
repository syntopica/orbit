import { z } from 'zod'

// doctor.json as `atrium doctor --publish` writes it at the end of the hourly
// refresh: per check a name, a verdict, a severity and a fixed code, never the
// summary prose. Unknown fields are stripped, never rejected.
export const atriumDoctorSchema = z.object({
  schemaVersion: z.literal(1),
  ok: z.boolean(),
  writtenAt: z.iso.datetime({ offset: true }),
  checks: z.array(
    z.object({
      name: z.string(),
      ok: z.boolean(),
      severity: z.enum(['ok', 'warn', 'broken']),
      code: z.string(),
    }),
  ),
})
