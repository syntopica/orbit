import { z } from 'zod'

// Every provenance atrium's trust_for_role assigns: a note is curated,
// conversation turns are history, episodes and syntheses are synthesized,
// third-party saved content is untrusted, and anything else unknown.
export const atriumTrustSchema = z.enum([
  'curated',
  'history',
  'synthesized',
  'untrusted',
  'unknown',
])
