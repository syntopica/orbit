import type { z } from 'zod'

import type { workerViewSchema } from '../schemas/workerViewSchema'

export type WorkerView = z.infer<typeof workerViewSchema>
