import { z } from 'zod'

import { PAGE_ID_PLACEHOLDER } from './pageIdPlaceholder'

// Per engine: the command (relative to the engine's checkout from the
// instance config, or absolute), the argument lists orbit may run, and extra
// environment variables beyond the allowlist (spec 5.3). `{pageId}` is the
// only placeholder; any other `{...}` argument is refused.
export const engineTableSchema = z.partialRecord(
  z.enum(['brain', 'clips']),
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
                .refine(
                  (arg) => !/[{}]/.test(arg) || arg === PAGE_ID_PLACEHOLDER,
                ),
            )
            .min(1),
        )
        .min(1),
      env: z
        .record(z.string().regex(/^[A-Z][A-Z0-9_]*$/), z.string())
        .default({}),
    })
    .strict(),
)
