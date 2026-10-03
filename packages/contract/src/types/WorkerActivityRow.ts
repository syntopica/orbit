import type { z } from 'zod'

import type { workerActivityRowSchema } from '../schemas/workerActivityRowSchema'

export type WorkerActivityRow = z.infer<typeof workerActivityRowSchema>
