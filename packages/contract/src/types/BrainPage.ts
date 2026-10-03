import type { z } from 'zod'

import type { brainPageSchema } from '../schemas/brainPageSchema'

export type BrainPage = z.infer<typeof brainPageSchema>
