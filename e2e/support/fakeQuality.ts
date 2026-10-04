export const fakeQuality = (): string =>
  JSON.stringify({
    attempts: [
      {
        queue: 'queue.a',
        tier: 'fast',
        provider: 'runner-a',
        model: 'model-a',
        attempts: 12,
        succeeded: 10,
        schema_violations: 0,
        failed: 2,
        preempted: 0,
        mean_wall_s: 2.5,
      },
      {
        queue: 'queue.b',
        tier: 'fast',
        provider: 'openrouter',
        model: 'model-b',
        attempts: 30,
        succeeded: 28,
        schema_violations: 0,
        failed: 2,
        preempted: 0,
        mean_wall_s: null,
      },
    ],
    ratings: [],
    judged: [
      {
        queue: 'queue.a',
        provider: 'runner-a',
        model: 'model-a',
        judged: 12,
        mean_score: 0.8,
        best: 3,
      },
      {
        queue: 'queue.b',
        provider: 'openrouter',
        model: 'model-b',
        judged: 30,
        mean_score: 0.7,
        best: 5,
      },
    ],
  })
