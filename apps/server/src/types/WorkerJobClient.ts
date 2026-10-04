export type WorkerJobClient = (
  path: string,
  method: 'GET' | 'POST',
  reveal: string | null,
  signal: AbortSignal,
) => Promise<{ status: number; body: string }>
