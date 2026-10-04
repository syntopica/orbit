import { readFileSync } from 'node:fs'
import path from 'node:path'

const entryPattern = /<script type="module"[^>]*\ssrc="\/([^"]+)"/
const staticImportPattern = /(?:\bfrom|\bimport)\s*"\.\/([^"]+\.js)"/g

// The entry script of the built index.html and every chunk it imports
// statically, as paths relative to the build root: the initial download.
export const entryClosure = (root) => {
  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  const entry = entryPattern.exec(html)?.[1]
  if (entry === undefined) throw new Error('no module entry in index.html')
  const seen = new Set([entry])
  for (const file of seen) {
    const source = readFileSync(path.join(root, file), 'utf8')
    for (const match of source.matchAll(staticImportPattern))
      seen.add(path.posix.join(path.posix.dirname(file), match[1]))
  }
  return [...seen]
}
