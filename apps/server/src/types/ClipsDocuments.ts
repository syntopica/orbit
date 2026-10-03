import type { z } from 'zod'

import type { clipsStatusSchema } from '../adapters/clips/clipsStatusSchema'
import type { doctorDocumentSchema } from '../engines/doctorDocumentSchema'

export type ClipsDocuments = {
  readonly status: z.infer<typeof clipsStatusSchema>
  readonly doctor: z.infer<typeof doctorDocumentSchema>
}
