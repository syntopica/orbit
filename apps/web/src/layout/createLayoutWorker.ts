// A module worker from orbit's own origin: the forceatlas2 package's bundled
// worker starts from a blob: URL, which the CSP (default-src 'self') refuses.
export const createLayoutWorker = (): Worker =>
  new Worker(new URL('./layoutWorker.ts', import.meta.url), { type: 'module' })
