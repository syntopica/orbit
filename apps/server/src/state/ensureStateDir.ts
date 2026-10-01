import { chmod, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export const ensureStateDir = async (dataDir: string): Promise<string> => {
  const dir = join(dataDir, 'orbit')
  await mkdir(dir, { recursive: true, mode: 0o700 })
  await chmod(dir, 0o700)
  return dir
}
