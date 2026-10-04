import type { z } from 'zod'

import type { atriumPassDocumentSchema } from '../adapters/atrium/atriumPassDocumentSchema'

export type AtriumPassDocument = z.infer<typeof atriumPassDocumentSchema>
