import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { loadInstanceConfig } from './loadInstanceConfig'

const instance = async (files: Record<string, unknown>): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-instance-'))
  for (const [name, body] of Object.entries(files)) {
    await writeFile(join(dir, name), JSON.stringify(body))
  }
  return dir
}

describe('loadInstanceConfig', () => {
  it('resolves engine paths against the instance and applies the local overlay', async () => {
    const dir = await instance({
      'syntopica.config.json': {
        schemaVersion: 1,
        engines: { brain: { path: '../brain' } },
      },
      'syntopica.local.json': { engines: { clips: { path: '/opt/clips' } } },
    })
    const config = await loadInstanceConfig(dir)
    expect(config.engines['brain']?.path).toBe(join(dir, '../brain'))
    expect(config.engines['clips']?.path).toBe('/opt/clips')
  })
  it('works without a local overlay', async () => {
    const dir = await instance({
      'syntopica.config.json': { engines: { brain: { path: 'b' } } },
    })
    expect((await loadInstanceConfig(dir)).engines['brain']?.path).toBe(
      join(dir, 'b'),
    )
  })
  it('fails when the instance has no config file', async () => {
    const dir = await instance({})
    await expect(loadInstanceConfig(dir)).rejects.toThrow(
      'syntopica.config.json',
    )
  })
})
