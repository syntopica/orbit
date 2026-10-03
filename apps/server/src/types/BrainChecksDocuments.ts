import type { z } from 'zod'

import type { brainLintSchema } from '../adapters/brain/brainLintSchema'
import type { doctorDocumentSchema } from '../engines/doctorDocumentSchema'

export type BrainChecksDocuments = {
  readonly lint: z.infer<typeof brainLintSchema>
  readonly doctor: z.infer<typeof doctorDocumentSchema>
}
