import { readFile } from 'node:fs/promises'

export const readFailureCount = async (path: string): Promise<number> => {
  const text = await readFile(path, 'utf8').catch(() => '0')
  const count = Number.parseInt(text, 10)
  return Number.isSafeInteger(count) && count > 0 ? count : 0
}
