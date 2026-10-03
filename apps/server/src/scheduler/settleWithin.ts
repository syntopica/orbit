// Waits for `work` to settle, but no longer than `limitMs`, so a read that
// ignores its abort signal cannot halt the loop that started it.
export const settleWithin = async (
  work: Promise<unknown>,
  limitMs: number,
): Promise<void> => {
  let timer: NodeJS.Timeout | undefined
  const limit = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, limitMs)
  })
  try {
    await Promise.race([
      work.then(
        () => undefined,
        () => undefined,
      ),
      limit,
    ])
  } finally {
    clearTimeout(timer)
  }
}
