import type { z } from 'zod'

import type { atriumSynthesisContentSchema } from '../schemas/atriumSynthesisContentSchema'

export type AtriumSynthesisContent = z.infer<
  typeof atriumSynthesisContentSchema
>
