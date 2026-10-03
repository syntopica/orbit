import { chmod, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createWorkerAdapter } from './createWorkerAdapter'

describe('createWorkerAdapter token file', () => {
  it('reports an unreadable token file as permission_denied', async () => {
    const path = join(
      await mkdtemp(join(tmpdir(), 'orbit-worker-')),
      'admin.token',
    )
    await writeFile(path, 'secret-token\n')
    await chmod(path, 0o000)
    const fetcher = vi.fn<typeof fetch>()
    const adapter = createWorkerAdapter({
      url: 'http://127.0.0.1:8765',
      tokenFile: path,
      cadenceMs: 5000,
      fetch: fetcher,
    })
    const error = await adapter
      .read(new AbortController().signal)
      .catch((e: unknown) => e)
    expect(error).toMatchObject({ reason: 'permission_denied' })
    expect(fetcher).not.toHaveBeenCalled()
  })
})
