import type { z } from 'zod'

import type { atriumPassesDocumentSchema } from '../adapters/atrium/atriumPassesDocumentSchema'

export type AtriumPassesDocument = z.infer<typeof atriumPassesDocumentSchema>
