import { writeFile } from 'node:fs/promises'

export const writeFailureCount = async (
  path: string,
  count: number,
): Promise<void> => {
  await writeFile(path, `${String(count)}\n`, { mode: 0o600 })
}
