import type { z } from 'zod'

import type { brainChecksSchema } from '../schemas/brainChecksSchema'

export type BrainChecks = z.infer<typeof brainChecksSchema>
