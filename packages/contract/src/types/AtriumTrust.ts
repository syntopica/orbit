import type { z } from 'zod'

import type { atriumTrustSchema } from '../schemas/atriumTrustSchema'

export type AtriumTrust = z.infer<typeof atriumTrustSchema>
