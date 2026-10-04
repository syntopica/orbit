import { z } from 'zod'

// Backlog limits that turn a healthy card `warn` with reason `backlog`. Absent
// means counts are shown but never warned on.
export const warningsConfigSchema = z
  .object({
    clipsOldestDays: z.number().int().min(1).max(3650).optional(),
    pendingBlocked: z.number().int().min(0).optional(),
  })
  .strict()
