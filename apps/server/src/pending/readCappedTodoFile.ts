import { open } from 'node:fs/promises'

export const readCappedTodoFile = async (
  path: string,
  signal: AbortSignal,
): Promise<Buffer | null> => {
  const handle = await open(path, 'r')
  try {
    if ((await handle.stat()).size > 1_048_576) return null
    if (signal.aborted) throw new Error('aborted')
    const buffer = Buffer.alloc(1_048_577)
    const { bytesRead } = await handle.read(buffer, 0, buffer.byteLength, 0)
    return bytesRead > 1_048_576 ? null : buffer.subarray(0, bytesRead)
  } finally {
    await handle.close()
  }
}
