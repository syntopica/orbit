import { access } from 'node:fs/promises'
import { join } from 'node:path'

import { resolveWebRoot } from '../http/resolveWebRoot'

// serveWeb resolves the root once; a missing one would 404 until restart.
export const assertWebRoot = async (webRoot: string): Promise<void> => {
  const root = await resolveWebRoot(webRoot)
  const indexed =
    root !== null &&
    (await access(join(root, 'index.html')).then(
      () => true,
      () => false,
    ))
  if (!indexed) throw new Error('web root is missing or has no index.html')
}
