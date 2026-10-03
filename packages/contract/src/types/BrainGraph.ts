import type { z } from 'zod'

import type { brainGraphSchema } from '../schemas/brainGraphSchema'

export type BrainGraph = z.infer<typeof brainGraphSchema>
