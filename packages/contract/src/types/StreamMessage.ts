import type { z } from 'zod'

import type { streamMessageSchema } from '../schemas/streamMessageSchema'

export type StreamMessage = z.infer<typeof streamMessageSchema>
