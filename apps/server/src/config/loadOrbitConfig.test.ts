import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { loadOrbitConfig } from './loadOrbitConfig'

const withOrbitJson = async (body: unknown): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-config-'))
  await mkdir(join(dir, 'orbit'))
  await writeFile(join(dir, 'orbit', 'orbit.json'), JSON.stringify(body))
  return dir
}

describe('loadOrbitConfig', () => {
  it('applies defaults when orbit.json is absent', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-config-'))
    const config = await loadOrbitConfig(dir)
    expect(config.port).toBe(8790)
    expect(config.allowedHosts).toEqual([])
    expect(config.synthetic).toBe(false)
  })
  it('reads launchd labels', async () => {
    const dir = await withOrbitJson({
      launchd: {
        labels: [
          {
            component: 'worker',
            label: 'com.example.worker',
            role: 'keepalive',
            plist: '/x.plist',
          },
        ],
      },
    })
    const config = await loadOrbitConfig(dir)
    expect(config.launchd?.labels[0]?.label).toBe('com.example.worker')
    expect(config.launchd?.launchctl).toBe('/bin/launchctl')
  })
  it('rejects unknown keys and unsafe labels', async () => {
    await expect(
      loadOrbitConfig(await withOrbitJson({ extra: 1 })),
    ).rejects.toThrow()
    const bad = {
      launchd: {
        labels: [
          { component: 'worker', label: 'a/b', role: 'scheduled', plist: '/x' },
        ],
      },
    }
    await expect(loadOrbitConfig(await withOrbitJson(bad))).rejects.toThrow()
  })
})
