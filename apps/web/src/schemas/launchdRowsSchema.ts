import { COMPONENT_IDS } from '@orbit/contract'
import { z } from 'zod'

export const launchdRowsSchema = z.object({
  rows: z.array(
    z.object({
      component: z.enum(COMPONENT_IDS),
      label: z.string(),
      role: z.enum(['scheduled', 'keepalive']),
      actions: z.array(z.enum(['run', 'restart'])).default([]),
      schedule: z
        .object({
          intervalS: z.number().nullable(),
          calendar: z.boolean(),
          keepAlive: z.boolean(),
        })
        .nullable(),
    }),
  ),
})
