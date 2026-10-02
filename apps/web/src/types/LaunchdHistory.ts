import type { z } from 'zod'

import type { launchdHistorySchema } from '../schemas/launchdHistorySchema'

export type LaunchdHistory = z.infer<typeof launchdHistorySchema>
