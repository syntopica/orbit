import type { z } from 'zod'

import type { pendingViewSchema } from '../schemas/pendingViewSchema'

export type PendingView = z.infer<typeof pendingViewSchema>
