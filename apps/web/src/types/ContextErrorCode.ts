import type { z } from 'zod'

import type { contextErrorSchema } from '../schemas/contextErrorSchema'

export type ContextErrorCode = z.infer<typeof contextErrorSchema>['error']
