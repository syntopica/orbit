import type { z } from 'zod'

import type { brainRelatedSchema } from '../schemas/brainRelatedSchema'

export type BrainRelated = z.infer<typeof brainRelatedSchema>
