import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { stableNodePath } from './stableNodePath'

// A Homebrew-shaped layout: the binary lives in a versioned Cellar directory
// and a stable bin directory links to it.
const layout = () => {
  const root = mkdtempSync(join(tmpdir(), 'orbit-node-'))
  const cellar = join(root, 'Cellar', 'node', '26.10.0_1', 'bin')
  const bin = join(root, 'bin')
  mkdirSync(cellar, { recursive: true })
  mkdirSync(bin)
  const real = join(cellar, 'node')
  writeFileSync(real, '')
  chmodSync(real, 0o755)
  symlinkSync(real, join(bin, 'node'))
  return { real, bin, cellar }
}

describe('stableNodePath', () => {
  it('prefers a link on PATH to the running node, which survives an upgrade', () => {
    const { real, bin, cellar } = layout()
    expect(stableNodePath(real, `${cellar}:/usr/bin:${bin}`)).toBe(
      join(bin, 'node'),
    )
  })

  it('keeps the running node when nothing on PATH links to it', () => {
    const { real, cellar } = layout()
    expect(stableNodePath(real, `${cellar}:/usr/bin`)).toBe(real)
    expect(stableNodePath(real, undefined)).toBe(real)
  })
})
