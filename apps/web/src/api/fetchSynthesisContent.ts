import { atriumSynthesisContentSchema } from '@orbit/contract'

import { apiFetch } from './apiFetch'

// Synthesized text is personal content: asked for with the reveal header,
// one record at a time (spec 6.6).
export const fetchSynthesisContent = async (
  jobKey: string,
  signal: AbortSignal,
) => {
  const response = await apiFetch(
    `/api/atrium/syntheses/${encodeURIComponent(jobKey)}/content`,
    { headers: { 'X-Orbit-Reveal': 'personal' }, signal },
  )
  if (!response.ok) throw new Error(String(response.status))
  return atriumSynthesisContentSchema.parse(await response.json())
}
