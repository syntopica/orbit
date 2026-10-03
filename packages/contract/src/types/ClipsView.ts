import type { z } from 'zod'

import type { clipsViewSchema } from '../schemas/clipsViewSchema'

export type ClipsView = z.infer<typeof clipsViewSchema>
