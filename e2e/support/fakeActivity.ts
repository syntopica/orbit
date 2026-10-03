// GET /v1/activity for the fake coordinator, built against the current clock
// so the newest buckets are always on the chart.
export const fakeActivity = (hours: number): string => {
  const bucket = hours <= 48 ? 3600 : 21_600
  const now = Date.now() / 1000
  const last = Math.floor(now / bucket) * bucket
  const row = (back: number, overrides: Record<string, unknown>) => ({
    bucket: last - back * bucket,
    queue: 'queue.a',
    provider: 'agy',
    sampling: false,
    outcome: 'succeeded',
    error: null,
    attempts: 4,
    wall_s: 120,
    tokens_in: 900,
    tokens_out: 300,
    ...overrides,
  })
  return JSON.stringify({
    since: now - hours * 3600,
    bucket_s: bucket,
    rows: [
      row(0, {}),
      row(0, { provider: 'openrouter', attempts: 2 }),
      row(0, { outcome: 'failed', error: 'timeout', attempts: 1 }),
      row(1, { provider: 'ollama', queue: 'queue.b', attempts: 6 }),
      row(2, { outcome: 'failed', error: 'runner_failed', attempts: 2 }),
      row(2, { sampling: true, provider: 'openrouter', attempts: 3 }),
    ],
  })
}
