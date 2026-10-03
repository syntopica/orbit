import { vi } from 'vitest'

// Each request answers the first route whose key prefixes its path: a number
// is a bare status, anything else JSON; other paths answer an empty 200.
export const stubBrainFetch = (
  routes: Readonly<Record<string, unknown>>,
): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const key = Object.keys(routes).find((prefix) => input.startsWith(prefix))
      const body = key === undefined ? undefined : routes[key]
      if (typeof body === 'number')
        return Promise.resolve(new Response(null, { status: body }))
      if (body === undefined)
        return Promise.resolve(new Response(null, { status: 200 }))
      return Promise.resolve(Response.json(body))
    }),
  )
}
