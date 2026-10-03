import type { z } from 'zod'

import type { engineTableSchema } from '../engines/engineTableSchema'

export type EngineTable = z.infer<typeof engineTableSchema>
