import { identifierSchema } from './identifierSchema'

// A field added after the first worker release: absent reads as null, so an
// older server or worker still parses.
export const identifierOrNullSchema = identifierSchema.nullable().default(null)
