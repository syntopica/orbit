import { realpath, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'

// The real path of a regular file inside webRoot, or null. Symlinks are
// resolved first, so one pointing out of webRoot is refused.
export const resolveWebFile = async (
  webRoot: string,
  path: string,
): Promise<string | null> => {
  const root = await realpath(webRoot).catch(() => null)
  if (root === null) return null
  const file = await realpath(resolve(root, `.${path}`)).catch(() => null)
  if (file === null || !file.startsWith(root + sep)) return null
  const stats = await stat(file).catch(() => null)
  return stats?.isFile() === true ? file : null
}
