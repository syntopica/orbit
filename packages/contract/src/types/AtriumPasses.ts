import type { z } from 'zod'

import type { atriumPassesSchema } from '../schemas/atriumPassesSchema'

export type AtriumPasses = z.infer<typeof atriumPassesSchema>
