import type { z } from 'zod'

import type { atriumSynthesesSchema } from '../schemas/atriumSynthesesSchema'

export type AtriumSyntheses = z.infer<typeof atriumSynthesesSchema>
