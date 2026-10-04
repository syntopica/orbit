import type { z } from 'zod'

import type { atriumPassSchema } from '../schemas/atriumPassSchema'

export type AtriumPass = z.infer<typeof atriumPassSchema>
