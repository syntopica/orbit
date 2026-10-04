import { COMPONENT_IDS, FLOW_STAGE_IDS } from '@orbit/contract'
import { z } from 'zod'

export const launchdLabelSchema = z
  .object({
    component: z.enum(COMPONENT_IDS),
    label: z.string().regex(/^[\w.-]{1,64}$/),
    role: z.enum(['scheduled', 'keepalive']),
    plist: z.string().min(1),
    stage: z.enum(FLOW_STAGE_IDS).optional(),
    actions: z.array(z.enum(['run', 'restart'])).default([]),
  })
  .strict()
  .refine(
    (entry) =>
      entry.actions.every((action) =>
        entry.role === 'scheduled' ? action === 'run' : action === 'restart',
      ),
    'action must match label role',
  )
  .refine((entry) => new Set(entry.actions).size === entry.actions.length)
