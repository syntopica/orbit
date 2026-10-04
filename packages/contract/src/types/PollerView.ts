import type { z } from 'zod'

import type { pollerViewSchema } from '../schemas/pollerViewSchema'

export type PollerView = z.infer<typeof pollerViewSchema>
