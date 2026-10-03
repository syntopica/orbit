import type { z } from 'zod'

import type { brainPageDocumentSchema } from '../adapters/brain/brainPageDocumentSchema'

export type BrainPageDocument = z.infer<typeof brainPageDocumentSchema>
