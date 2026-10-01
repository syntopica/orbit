import type { z } from 'zod'

import type { orbitConfigSchema } from '../config/orbitConfigSchema'

export type OrbitConfig = z.infer<typeof orbitConfigSchema>
