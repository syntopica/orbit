import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

// Walks up from the running file (the bundle in dist/, or the source tree in
// tests) to the repository's launchd/ folder, and no further than the
// workspace root, so a stray template elsewhere on disk is never picked up.
export const readPlistTemplate = (from: string): string => {
  let dir = from
  for (;;) {
    try {
      return readFileSync(
        join(dir, 'launchd', 'com.syntopica.orbit.plist.template'),
        'utf8',
      )
    } catch {
      const parent = dirname(dir)
      if (parent === dir || existsSync(join(dir, 'pnpm-workspace.yaml')))
        throw new Error('plist template not found')
      dir = parent
    }
  }
}
