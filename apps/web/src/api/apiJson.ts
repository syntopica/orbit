import type { z } from 'zod'

import { ApiError } from './ApiError'
import { apiFetch } from './apiFetch'

export const apiJson = async <T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> => {
  const response = await apiFetch(path)
  if (!response.ok) throw new ApiError(response.status)
  return schema.parse(await response.json())
}
