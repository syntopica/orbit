import { dirname } from 'node:path'

import { collectIo } from '../../test/collectIo'
import { printPlistCommand } from './printPlistCommand'

describe('printPlistCommand', () => {
  it('prints a PATH led by the running node and the shell entries', () => {
    const { io, out } = collectIo({
      SYNTOPICA_DATA: '/srv/instance',
      PATH: '/shell/bin:/usr/bin',
    })
    expect(printPlistCommand(io)).toBe(0)
    expect(out.join('\n')).toContain(
      `<key>PATH</key>\n    <string>${dirname(process.execPath)}:/shell/bin:/usr/bin</string>`,
    )
  })
})
