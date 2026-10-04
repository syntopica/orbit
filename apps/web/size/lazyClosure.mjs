import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { entryClosure } from './entryClosure.mjs'

const staticImportPattern = /(?:\bfrom|\bimport)\s*"\.\/([^"]+\.js)"/g

// A lazily loaded chunk, found by its name, and every chunk it imports
// statically that the initial route has not already loaded: what opening
// that view downloads. A shared chunk (three.js for both 3D views) counts
// in full for each view that needs it.
export const lazyClosure = (root, name) => {
  const initial = new Set(entryClosure(root))
  const chunk = readdirSync(path.join(root, 'assets')).find(
    (file) => file.startsWith(`${name}-`) && file.endsWith('.js'),
  )
  if (chunk === undefined) throw new Error(`no ${name} chunk in the build`)
  const seen = new Set([`assets/${chunk}`])
  for (const file of seen) {
    const source = readFileSync(path.join(root, file), 'utf8')
    for (const match of source.matchAll(staticImportPattern)) {
      const next = path.posix.join(path.posix.dirname(file), match[1])
      if (!initial.has(next)) seen.add(next)
    }
  }
  return [...seen]
}
