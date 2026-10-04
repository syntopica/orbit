import type { WorkerSearch } from '../types/WorkerSearch'

export const validateWorkerSearch = (
  search: Record<string, unknown>,
): WorkerSearch => ({
  range: search['range'] === '7d' ? '7d' : '24h',
  ...(search['costs'] === '7d' || search['costs'] === '30d'
    ? { costs: search['costs'] }
    : {}),
})
