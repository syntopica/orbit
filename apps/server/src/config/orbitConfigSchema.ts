import { COMPONENT_IDS, FLOW_STAGE_IDS } from '@orbit/contract'
import { isAbsolute } from 'node:path'
import { z } from 'zod'

import { engineTableSchema } from '../engines/engineTableSchema'
import { pendingConfigSchema } from './pendingConfigSchema'

export const orbitConfigSchema = z
  .object({
    port: z.number().int().min(1024).max(65_535).default(8790),
    allowedHosts: z.array(z.string().regex(/^[a-z0-9.-]{1,253}$/)).default([]),
    allowedLogins: z.array(z.string().min(3).max(254)).default([]),
    synthetic: z.boolean().default(false),
    launchd: z
      .object({
        launchctl: z.string().refine(isAbsolute).default('/bin/launchctl'),
        plutil: z.string().refine(isAbsolute).default('/usr/bin/plutil'),
        labels: z
          .array(
            z
              .object({
                component: z.enum(COMPONENT_IDS),
                label: z.string().regex(/^[\w.-]{1,64}$/),
                role: z.enum(['scheduled', 'keepalive']),
                plist: z.string().min(1),
                stage: z.enum(FLOW_STAGE_IDS).optional(),
              })
              .strict(),
          )
          .default([]),
      })
      .strict()
      .optional(),
    worker: z
      .object({
        url: z.url({ protocol: /^https?$/ }),
        tokenFile: z.string().min(1),
      })
      .strict()
      .optional(),
    atrium: z
      .object({
        statusDir: z.string().refine(isAbsolute),
        refreshIntervalMs: z.number().int().min(60_000).default(3_600_000),
      })
      .strict()
      .optional(),
    capture: z
      .object({
        url: z.url({ protocol: /^https?$/ }),
        tokenFile: z.string().min(1),
      })
      .strict()
      .optional(),
    engines: engineTableSchema.default({}),
    pending: pendingConfigSchema.optional(),
    cadenceMs: z
      .partialRecord(z.enum(COMPONENT_IDS), z.number().int().min(1000))
      .default({}),
  })
  .strict()
