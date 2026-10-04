import { z } from 'zod'

// One entry of `clips status --json --items`, as the engine prints it. Parsed
// item by item, so one malformed entry drops that item, not the document.
export const clipsStatusItemSchema = z.object({
  id: z.string(),
  state: z.string(),
  reason: z.string(),
  failure: z.object({ stage: z.string(), code: z.string() }).nullable(),
  stage: z.string(),
  capturedAt: z.string().nullable(),
  lastTransitionAt: z.string().nullable(),
  attempts: z.number().int().nonnegative(),
  lastRun: z
    .object({
      startedAt: z.string(),
      durationMs: z.number().nonnegative(),
      outcome: z.string(),
      model: z.string(),
      boundary: z.string(),
      workerJobIds: z.array(z.string()),
      usage: z
        .object({
          inputTokens: z.number().int().nonnegative(),
          outputTokens: z.number().int().nonnegative(),
          cachedInputTokens: z.number().int().nonnegative().nullable(),
          reasoningTokens: z.number().int().nonnegative().nullable(),
        })
        .nullable(),
    })
    .nullable(),
  pages: z.array(z.string()),
})
