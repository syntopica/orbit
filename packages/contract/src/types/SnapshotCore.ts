import type { z } from 'zod'

import type { snapshotCoreSchema } from '../schemas/snapshotCoreSchema'

export type SnapshotCore = z.infer<typeof snapshotCoreSchema>
