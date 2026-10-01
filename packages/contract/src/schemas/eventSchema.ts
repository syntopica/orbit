import { z } from 'zod'

import { COMPONENT_IDS } from '../componentIds'
import { EVENT_KINDS } from '../eventKinds'
import { refValueSchema } from './refValueSchema'

export const eventSchema = z
  .object({
    at: z.iso.datetime(),
    component: z.enum(COMPONENT_IDS),
    kind: z.enum(EVENT_KINDS),
    severity: z.enum(['info', 'warn', 'error']),
    refs: z.record(z.string().regex(/^[a-z][a-zA-Z]{0,31}$/), refValueSchema),
  })
  .strict()
