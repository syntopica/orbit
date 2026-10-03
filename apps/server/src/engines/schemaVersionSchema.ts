import { z } from 'zod'

export const schemaVersionSchema = z.object({ schemaVersion: z.number().int() })
