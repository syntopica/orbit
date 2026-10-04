import type { z } from 'zod'

import type { atriumSynthesisRowSchema } from '../schemas/atriumSynthesisRowSchema'

export type AtriumSynthesisRow = z.infer<typeof atriumSynthesisRowSchema>
