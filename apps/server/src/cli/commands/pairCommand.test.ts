import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { collectIo } from '../../test/collectIo'
import { tempInstance } from '../../test/tempInstance'
import { pairCommand } from './pairCommand'

describe('pairCommand', () => {
  it('refuses without a tailnet host', async () => {
    const { io, err, out } = collectIo({
      SYNTOPICA_DATA: await tempInstance(),
    })
    expect(await pairCommand([], io)).toBe(1)
    expect(err.join()).toContain('allowedHosts')
    expect(out).toEqual([])
  })

  it('prints a pairing URL with the invitation in the fragment, once', async () => {
    const data = await tempInstance()
    await mkdir(join(data, 'orbit'), { recursive: true })
    await writeFile(
      join(data, 'orbit', 'orbit.json'),
      JSON.stringify({ allowedHosts: ['orbit.example.ts.net'] }),
    )
    const { io, out, err } = collectIo({ SYNTOPICA_DATA: data })
    expect(await pairCommand([], io)).toBe(0)
    const url =
      /https:\/\/orbit\.example\.ts\.net\/pair#([\w-]{11})\.([\w-]{22})/.exec(
        out.join('\n'),
      )
    expect(url).not.toBeNull()
    const secret = url?.[2] ?? ''
    expect(out.join('\n').split(secret)).toHaveLength(2)
    expect(err).toEqual([])
  })
})
