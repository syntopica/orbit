import type { z } from 'zod'

import type { pendingSchema } from '../schemas/pendingSchema'

export type Pending = z.infer<typeof pendingSchema>
