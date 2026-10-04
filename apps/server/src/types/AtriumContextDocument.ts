import type { z } from 'zod'

import type { atriumContextDocumentSchema } from '../adapters/atrium/atriumContextDocumentSchema'

export type AtriumContextDocument = z.infer<typeof atriumContextDocumentSchema>
