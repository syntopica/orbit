import { z } from 'zod'

import { engineActionSchema } from './engineActionSchema'
import { isPlaceholder } from './isPlaceholder'

// Per engine: the command (relative to the engine's checkout from the
// instance config, or absolute), the argument lists orbit may run, and extra
// environment variables beyond the allowlist (spec 5.3), and the timeout
// each read gets unless its caller sets one. `{pageId}`, `{query}` and
// `{jobKey}` are the only placeholders; any other `{...}` argument is refused.
export const engineTableSchema = z.partialRecord(
  z.enum(['atrium', 'brain', 'clips']),
  z
    .object({
      command: z.string().min(1),
      subcommands: z
        .array(
          z
            .array(
              z
                .string()
                .min(1)
                .refine((arg) => !/[{}]/.test(arg) || isPlaceholder(arg)),
            )
            .min(1),
        )
        .min(1),
      // Per-command read budget. Measured 2026-10-04: `clips status` and
      // `brain lint` reach 8-10 s at host load 20-125, so 10 s cut them off.
      timeoutMs: z.number().int().min(1000).max(60_000).default(10_000),
      env: z
        .record(z.string().regex(/^[A-Z][A-Z0-9_]*$/), z.string())
        .default({}),
      actions: z
        .record(z.string().regex(/^[\w.-]{1,64}$/), engineActionSchema)
        .default({}),
    })
    .strict(),
)
