import type { z } from 'zod'

import type { launchdRowsSchema } from '../schemas/launchdRowsSchema'

export type LaunchdRow = z.infer<typeof launchdRowsSchema>['rows'][number]
