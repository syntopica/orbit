// Detail results are cached for the adapter's cadence (spec 5.4); calls in
// flight share one load, and a failure is never cached.
export const createTtlCache = <T>(
  ttlMs: number,
  now: () => number,
): ((load: () => Promise<T>) => Promise<T>) => {
  let held: { value: T; at: number } | null = null
  let flight: Promise<T> | null = null
  return async (load) => {
    if (held !== null && now() - held.at < ttlMs) return held.value
    flight ??= (async () => {
      await Promise.resolve()
      try {
        const value = await load()
        held = { value, at: now() }
        return value
      } finally {
        flight = null
      }
    })()
    return flight
  }
}
