import '../zodConfig'

import { atriumContextSchema } from '@orbit/contract'

import { contextErrorSchema } from '../schemas/contextErrorSchema'
import { apiFetch } from './apiFetch'

// Throws an Error whose message is one of the fixed codes.
export const postAtriumContext = async (query: string) => {
  const response = await apiFetch('/api/atrium/context', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
  const body: unknown = await response.json().catch(() => null)
  if (response.ok) return atriumContextSchema.parse(body)
  const failure = contextErrorSchema.safeParse(body)
  throw new Error(failure.success ? failure.data.error : 'unavailable')
}
