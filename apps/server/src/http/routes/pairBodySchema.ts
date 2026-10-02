import { z } from 'zod'

// Invitation id (8 bytes) and secret (16 bytes) in base64url.
export const pairBodySchema = z
  .object({
    id: z.string().regex(/^[\w-]{11}$/),
    secret: z.string().regex(/^[\w-]{22}$/),
  })
  .strict()
