import { identifierSchema } from '@orbit/contract'
import { isAbsolute } from 'node:path'
import { z } from 'zod'

export const pendingConfigSchema = z
  .object({
    todoFiles: z
      .array(
        z
          .object({
            name: identifierSchema,
            path: z.string().refine(isAbsolute),
          })
          .strict(),
      )
      .max(50)
      .refine(
        (files) =>
          new Set(files.map((file) => file.name)).size === files.length,
      )
      .default([]),
  })
  .strict()
