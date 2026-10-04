import type { z } from 'zod'

import type { clipsItemSchema } from '../schemas/clipsItemSchema'

export type ClipsItem = z.infer<typeof clipsItemSchema>
