import { z } from 'zod'

// A result row's metadata as the worker sends it. Unknown keys inside
// `detail`, `executor` and `usage` are stripped, so nothing but these
// allowlisted fields reaches a view.
export const workerResultReportSchema = z.object({
  result_id: z.string(),
  control: z.string().nullable(),
  detail: z
    .object({
      error: z.string().optional(),
      schema_path: z.string().optional(),
    })
    .nullable(),
  executor: z
    .object({
      node: z.string().optional(),
      provider: z.string().optional(),
      model: z.string().optional(),
    })
    .nullable(),
  usage: z
    .object({
      tokens_in: z.number().optional(),
      tokens_out: z.number().optional(),
      cost_usd: z.number().optional(),
    })
    .nullable(),
  rating: z.string().nullable(),
  created: z.number(),
  acked: z.number().nullable(),
})
