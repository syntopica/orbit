import type { z } from 'zod'

import type { atriumRecentDocumentSchema } from '../adapters/atrium/atriumRecentDocumentSchema'

export type AtriumRecentDocument = z.infer<typeof atriumRecentDocumentSchema>
