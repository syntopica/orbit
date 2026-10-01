import type { z } from 'zod'

import type { healthSchema } from '../schemas/healthSchema'

export type Health = z.infer<typeof healthSchema>
