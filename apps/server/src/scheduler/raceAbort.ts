import { ProcessError } from '../process/ProcessError'

export const raceAbort = async <T>(
  work: Promise<T>,
  signal: AbortSignal,
): Promise<T> => {
  let onAbort: () => void = () => undefined
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => {
      reject(new ProcessError('timeout'))
    }
    if (signal.aborted) onAbort()
    else signal.addEventListener('abort', onAbort, { once: true })
  })
  try {
    return await Promise.race([work, aborted])
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}
