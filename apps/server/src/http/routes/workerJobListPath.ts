import { isIdentifier } from '../../workerView/isIdentifier'

export const workerJobListPath = (
  query: Record<string, string>,
): { path: string } | { error: 'bad_request' | 'bad_cursor' } => {
  const params = new URLSearchParams()
  for (const name of ['queue', 'state', 'producer'] as const) {
    const value = query[name]
    if (value === undefined) continue
    if (!isIdentifier(value)) return { error: 'bad_request' }
    params.set(name, value)
  }
  const before = query['before']
  if (before !== undefined) {
    if (before.length < 1 || before.length > 512) return { error: 'bad_cursor' }
    params.set('before', before)
  }
  const limit = query['limit']
  if (limit !== undefined) {
    if (!/^(?:[1-9]|[1-9]\d|100)$/.test(limit)) return { error: 'bad_request' }
    params.set('limit', limit)
  }
  return { path: `/v1/admin/jobs?${params.toString()}` }
}
