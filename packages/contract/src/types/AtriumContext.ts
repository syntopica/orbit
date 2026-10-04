import type { z } from 'zod'

import type { atriumContextSchema } from '../schemas/atriumContextSchema'

export type AtriumContext = z.infer<typeof atriumContextSchema>
