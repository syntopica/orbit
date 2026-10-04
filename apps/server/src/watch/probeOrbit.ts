// True when orbit's own HTTP server answers on loopback at all: any status
// below 500 means its event loop is serving requests.
export const probeOrbit = async (
  port: number,
  fetcher: typeof fetch = fetch,
  timeoutMs = 10_000,
): Promise<boolean> => {
  try {
    const res = await fetcher(`http://127.0.0.1:${String(port)}/`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    return res.status < 500
  } catch {
    return false
  }
}
