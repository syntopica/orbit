import { z } from 'zod'

// An atrium synthesis registry key: 32 lowercase hex characters, so a key
// can name neither a path nor an option.
export const synthesisJobKeySchema = z.string().regex(/^[0-9a-f]{32}$/)
