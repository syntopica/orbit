import type { z } from 'zod'

import type { atriumViewSchema } from '../schemas/atriumViewSchema'

export type AtriumView = z.infer<typeof atriumViewSchema>
