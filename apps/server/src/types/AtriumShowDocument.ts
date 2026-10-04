import type { z } from 'zod'

import type { atriumShowDocumentSchema } from '../adapters/atrium/atriumShowDocumentSchema'

export type AtriumShowDocument = z.infer<typeof atriumShowDocumentSchema>
