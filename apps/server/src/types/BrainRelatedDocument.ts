import type { z } from 'zod'

import type { brainRelatedDocumentSchema } from '../adapters/brain/brainRelatedDocumentSchema'

export type BrainRelatedDocument = z.infer<typeof brainRelatedDocumentSchema>
