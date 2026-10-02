import { z } from 'zod'

// The admin token is 32 random bytes in base64url: exactly 43 characters.
export const tokenBodySchema = z
  .object({ token: z.string().regex(/^[\w-]{43}$/) })
  .strict()
