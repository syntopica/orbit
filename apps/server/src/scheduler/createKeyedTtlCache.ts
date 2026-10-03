// Per-key detail cache (spec 5.4): each key is held for the adapter's
// cadence, the oldest key is evicted past `maxKeys`, calls in flight for one
// key share a load, and a failure is never cached.
export const createKeyedTtlCache = <T>(
  ttlMs: number,
  now: () => number,
  maxKeys: number,
): ((key: string, load: () => Promise<T>) => Promise<T>) => {
  const held = new Map<string, { readonly value: T; readonly at: number }>()
  const flights = new Map<string, Promise<T>>()
  return async (key, load) => {
    const entry = held.get(key)
    if (entry !== undefined && now() - entry.at < ttlMs) return entry.value
    const pending = flights.get(key)
    if (pending !== undefined) return pending
    const flight = (async () => {
      await Promise.resolve()
      try {
        const value = await load()
        held.delete(key)
        held.set(key, { value, at: now() })
        const oldest = held.keys().next()
        if (held.size > maxKeys && oldest.done !== true)
          held.delete(oldest.value)
        return value
      } finally {
        flights.delete(key)
      }
    })()
    flights.set(key, flight)
    return flight
  }
}
