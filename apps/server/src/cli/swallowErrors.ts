// Wraps a timer callback so a transient failure never ends the process. The
// error is dropped on purpose: its content is never logged.
export const swallowErrors =
  (work: () => void): (() => void) =>
  () => {
    try {
      work()
    } catch {
      // Best effort: the next tick tries again.
    }
  }
