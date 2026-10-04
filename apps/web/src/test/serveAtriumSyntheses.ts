import { vi } from 'vitest'

import { ATRIUM_SYNTHESIS_FIXTURE } from './atriumSynthesisFixture'

// Answers the atrium routes from the fixture; `over` replaces a path's body,
// and 503 answers that path unavailable.
export const serveAtriumSyntheses = (
  over: Readonly<Record<string, unknown>> = {},
) => {
  const { NOW, KEY, view, passes, syntheses, content } =
    ATRIUM_SYNTHESIS_FIXTURE
  const fetch = vi.fn(async (path: string) => {
    const body: Record<string, unknown> = {
      '/api/atrium': view,
      '/api/atrium/passes': passes,
      '/api/atrium/syntheses': syntheses,
      [`/api/atrium/syntheses/${KEY}/content`]: content,
      ...over,
    }
    const answer = body[path] ?? { now: NOW, from: 0, runs: [], series: [] }
    return Promise.resolve(
      answer === 503
        ? Response.json({ error: 'unavailable' }, { status: 503 })
        : Response.json(answer),
    )
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}
