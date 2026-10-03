import { z } from 'zod'

// Per engine: the command (relative to the engine's checkout from the
// instance config, or absolute), the exact argument lists orbit may run, and
// extra environment variables beyond the allowlist (spec 5.3).
export const engineTableSchema = z.partialRecord(
  z.enum(['brain', 'clips']),
  z
    .object({
      command: z.string().min(1),
      subcommands: z.array(z.array(z.string().min(1)).min(1)).min(1),
      env: z
        .record(z.string().regex(/^[A-Z][A-Z0-9_]*$/), z.string())
        .default({}),
    })
    .strict(),
)
