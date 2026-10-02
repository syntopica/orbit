import type { z } from 'zod'

import type { workerCooldownSchema } from '../schemas/workerCooldownSchema'

export type WorkerCooldown = z.infer<typeof workerCooldownSchema>
