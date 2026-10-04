import { z } from 'zod'

// The fixed codes POST /api/atrium/context answers with.
export const contextErrorSchema = z.object({
  error: z.enum([
    'bad_request',
    'rate_limited',
    'unavailable',
    'engine_schema_unsupported',
  ]),
})
