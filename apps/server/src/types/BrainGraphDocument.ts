import type { z } from 'zod'

import type { brainGraphDocumentSchema } from '../adapters/brain/brainGraphDocumentSchema'

export type BrainGraphDocument = z.infer<typeof brainGraphDocumentSchema>
