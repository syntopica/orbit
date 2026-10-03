import type { Adapter } from '../types/Adapter'

export const syntheticAdapter = (read: Adapter['read']): Adapter => ({
  id: 'synthetic',
  cadenceMs: 1000,
  timeoutMs: 3000,
  freshnessMs: 5000,
  read,
})
