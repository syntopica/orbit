// Turns a synchronous throw from `work` into a rejection, so the caller's
// bookkeeping always sees the work settle.
export const startWork = async <T>(
  work: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
): Promise<T> => {
  const result = await work(signal)
  return result
}
