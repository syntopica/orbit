import { COMPONENT_IDS } from '@orbit/contract'
import { isAbsolute } from 'node:path'
import { z } from 'zod'

import { engineTableSchema } from '../engines/engineTableSchema'
import { launchdLabelSchema } from './launchdLabelSchema'
import { pendingConfigSchema } from './pendingConfigSchema'
import { warningsConfigSchema } from './warningsConfigSchema'

export const orbitConfigSchema = z
  .object({
    port: z.number().int().min(1024).max(65_535).default(8790),
    remotePort: z.number().int().min(1024).max(65_535).optional(),
    allowedHosts: z.array(z.string().regex(/^[a-z0-9.-]{1,253}$/)).default([]),
    allowedLogins: z.array(z.string().min(3).max(254)).default([]),
    synthetic: z.boolean().default(false),
    launchd: z
      .object({
        launchctl: z.string().refine(isAbsolute).default('/bin/launchctl'),
        plutil: z.string().refine(isAbsolute).default('/usr/bin/plutil'),
        labels: z.array(launchdLabelSchema).default([]),
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
    warnings: warningsConfigSchema.default({}),
    cadenceMs: z
      .partialRecord(z.enum(COMPONENT_IDS), z.number().int().min(1000))
      .default({}),
  })
  .strict()
  .refine((config) => config.remotePort !== config.port, {
    message: 'remotePort must differ from port',
    path: ['remotePort'],
  })
