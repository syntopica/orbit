import { chmod, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { z } from 'zod'

import { readStatusFile } from './readStatusFile'

const schema = z.object({ ok: z.boolean() })
const signal = () => new AbortController().signal
const fileWith = async (content: string) => {
  const path = join(await mkdtemp(join(tmpdir(), 'orbit-status-')), 's.json')
  await writeFile(path, content)
  return path
}

describe('readStatusFile', () => {
  it('returns null for an absent file and parses a present one', async () => {
    const path = await fileWith('{"ok":true}')
    expect(await readStatusFile(path, schema, signal())).toEqual({ ok: true })
    expect(await readStatusFile(`${path}.none`, schema, signal())).toBeNull()
  })

  it('refuses a file over 1 MiB as output_too_large', async () => {
    const path = await fileWith('x'.repeat(1_048_577))
    await expect(readStatusFile(path, schema, signal())).rejects.toMatchObject({
      reason: 'output_too_large',
    })
  })

  it('maps an unreadable file to permission_denied', async () => {
    const path = await fileWith('{"ok":true}')
    await chmod(path, 0o000)
    await expect(readStatusFile(path, schema, signal())).rejects.toMatchObject({
      reason: 'permission_denied',
    })
  })
})
