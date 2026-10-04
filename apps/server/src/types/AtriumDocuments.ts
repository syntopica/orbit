import type { z } from 'zod'

import type { atriumDoctorSchema } from '../adapters/atrium/atriumDoctorSchema'
import type { atriumRefreshSchema } from '../adapters/atrium/atriumRefreshSchema'
import type { atriumSynthesisSchema } from '../adapters/atrium/atriumSynthesisSchema'

export type AtriumDocuments = {
  readonly refresh: z.infer<typeof atriumRefreshSchema>
  readonly synthesis: z.infer<typeof atriumSynthesisSchema> | null
  readonly doctor: z.infer<typeof atriumDoctorSchema> | null
}
