import { z } from 'zod'

// Worker names, ids and codes are identifiers, not content: bounded and
// charset-checked so free text cannot ride along (spec 6.6).
export const identifierSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[\w.:/@+-]+$/)
