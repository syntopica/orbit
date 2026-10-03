import type { z } from 'zod'

import type { memoryFlowSchema } from '../schemas/memoryFlowSchema'

export type MemoryFlow = z.infer<typeof memoryFlowSchema>
