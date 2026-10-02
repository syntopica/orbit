export type DetailPool = {
  run<T>(
    work: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number,
  ): Promise<T>
}
