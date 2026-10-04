import type { z } from 'zod'

import type { pollerRowSchema } from '../schemas/pollerRowSchema'

export type PollerRow = z.infer<typeof pollerRowSchema>
