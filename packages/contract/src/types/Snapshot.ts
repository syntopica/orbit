import type { z } from 'zod'

import type { snapshotSchema } from '../schemas/snapshotSchema'

export type Snapshot = z.infer<typeof snapshotSchema>
