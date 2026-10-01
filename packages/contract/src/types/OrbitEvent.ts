import type { z } from 'zod'

import type { eventSchema } from '../schemas/eventSchema'

export type OrbitEvent = z.infer<typeof eventSchema>
