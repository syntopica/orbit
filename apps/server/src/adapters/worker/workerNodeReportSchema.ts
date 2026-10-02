import { z } from 'zod'

// A node's self-report. Unknown fields are dropped, not rejected: the worker
// may add fields. Everything but the coordinator's own age_s may be missing.
export const workerNodeReportSchema = z.object({
  reason: z.string().nullish(),
  idle_s: z.number().nullish(),
  on_ac: z.boolean().nullish(),
  pressure: z.string().nullish(),
  resident: z.array(z.string()).nullish(),
  age_s: z.number(),
  last_release: z
    .object({ code: z.string().nullable(), age_s: z.number() })
    .nullish(),
})
