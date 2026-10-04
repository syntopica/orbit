import { z } from 'zod'

export const engineActionSchema = z
  .object({
    args: z
      .array(
        z
          .string()
          .min(1)
          .refine((arg) => !/[{}]/.test(arg)),
      )
      .min(1),
    label: z.string().trim().min(1).max(64),
    timeoutS: z.number().int().min(1).max(1800).default(600),
  })
  .strict()
