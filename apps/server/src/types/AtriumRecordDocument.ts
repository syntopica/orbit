import type { z } from 'zod'

import type { atriumRecordDocumentSchema } from '../adapters/atrium/atriumRecordDocumentSchema'

export type AtriumRecordDocument = z.infer<typeof atriumRecordDocumentSchema>
