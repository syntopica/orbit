import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

// Walks up from the running file (the bundle in dist/, or the source tree in
// tests) to the repository's launchd/ folder.
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
      if (parent === dir) throw new Error('plist template not found')
      dir = parent
    }
  }
}
