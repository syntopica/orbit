import { z } from 'zod'

// `ageSeconds`, `exists` and `bytes` are ignored: orbit ages against its clock.
export const atriumInstantSchema = z.object({
  at: z.iso.datetime({ offset: true }).nullable(),
})
