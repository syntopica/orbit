// Calls `done` once `job` settles either way; the job's own caller observes
// its outcome, so a failure is not handled here.
export const afterSettled = async (
  job: Promise<unknown>,
  done: () => void,
): Promise<void> => {
  try {
    await job
  } catch {
    // observed by the caller through its own await
  } finally {
    done()
  }
}
