import { realpath, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'

// The real path of a regular file inside `root` (itself already a real path),
// or null. Symlinks are resolved first, so one pointing out of root is refused.
export const resolveWebFile = async (
  root: string | null,
  path: string,
): Promise<string | null> => {
  if (root === null) return null
  const file = await realpath(resolve(root, `.${path}`)).catch(() => null)
  if (file === null || !file.startsWith(root + sep)) return null
  const stats = await stat(file).catch(() => null)
  return stats?.isFile() === true ? file : null
}
