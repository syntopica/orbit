export const fakeCosts = (): string => {
  const day = new Date().toISOString().slice(0, 10)
  return JSON.stringify({
    rows: [
      {
        provider: 'agy',
        queue: 'queue.a',
        day,
        attempts: 4,
        succeeded: 4,
        tokens_in: 900,
        tokens_out: 300,
        cost_usd: 0,
        wall_s: 120,
      },
      {
        provider: 'openrouter',
        queue: 'queue.a',
        day,
        attempts: 2,
        succeeded: 1,
        tokens_in: 400,
        tokens_out: 180,
        cost_usd: 0.25,
        wall_s: 60,
      },
    ],
  })
}
