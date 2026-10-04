import { contextErrorSchema } from '../schemas/contextErrorSchema'
import type { ContextErrorCode } from '../types/ContextErrorCode'

// A thrown fixed code, or `unavailable` for anything else (network, parse).
export const toContextErrorCode = (error: unknown): ContextErrorCode => {
  const parsed = contextErrorSchema.shape.error.safeParse(
    error instanceof Error ? error.message : null,
  )
  return parsed.success ? parsed.data : 'unavailable'
}
