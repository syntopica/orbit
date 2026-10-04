import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { join } from 'node:path'

import { collectIo } from '../../test/collectIo'
import { tempInstance } from '../../test/tempInstance'
import { watchCommand } from './watchCommand'

const freePort = async (): Promise<number> =>
  new Promise((resolve) => {
    const probe = createServer()
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address()
      probe.close(() => {
        resolve(
          typeof address === 'object' && address !== null ? address.port : 0,
        )
      })
    })
  })

describe('watchCommand', () => {
  it('--print-plist prints the watcher plist', async () => {
    const { io, out } = collectIo({ SYNTOPICA_DATA: '/srv/instance' })
    expect(await watchCommand(['--print-plist'], io)).toBe(0)
    const text = out.join('\n')
    expect(text).toContain('<string>com.syntopica.orbit.watch</string>')
    expect(text).toContain('<string>watch</string>')
    expect(text).toContain('<key>StartInterval</key>')
    expect(text).not.toContain('KeepAlive')
    expect(text).not.toContain('__')
  })

  it('counts a miss when nothing answers on the configured port', async () => {
    const data = await tempInstance()
    await mkdir(join(data, 'orbit'), { recursive: true })
    await writeFile(
      join(data, 'orbit', 'orbit.json'),
      JSON.stringify({ port: await freePort() }),
    )
    const { io, out } = collectIo({ SYNTOPICA_DATA: data })
    expect(await watchCommand([], io)).toBe(0)
    expect(out).toEqual(['orbit-watch no answer (1 in a row)'])
    const files = join(data, 'orbit', 'watch-failures')
    expect(await readFile(files, 'utf8')).toBe('1\n')
  })

  it('restarts orbit through the configured launchctl on the second miss', async () => {
    const data = await tempInstance()
    await mkdir(join(data, 'orbit'), { recursive: true })
    await writeFile(
      join(data, 'orbit', 'orbit.json'),
      JSON.stringify({
        port: await freePort(),
        launchd: { launchctl: '/usr/bin/true', labels: [] },
      }),
    )
    await writeFile(join(data, 'orbit', 'watch-failures'), '1\n')
    const { io, out } = collectIo({ SYNTOPICA_DATA: data })
    expect(await watchCommand([], io)).toBe(1)
    expect(out).toEqual(['orbit-watch no answer (2 in a row), restarted'])
  })
})
