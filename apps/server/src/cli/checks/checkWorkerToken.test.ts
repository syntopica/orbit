import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { openTestState } from '../../test/openTestState'
import { checkWorkerToken } from './checkWorkerToken'

describe('checkWorkerToken', () => {
  it('passes when the worker is not configured', async () => {
    const state = await openTestState()
    expect(await checkWorkerToken(state)).toMatchObject({
      level: 'ok',
      detail: 'not configured',
    })
    state.close()
  })

  it('fails when the token file is unreadable, without naming it', async () => {
    const state = await openTestState({
      worker: { url: 'http://127.0.0.1:9', tokenFile: '/nonexistent/token' },
    })
    const result = await checkWorkerToken(state)
    expect(result).toMatchObject({ level: 'fail' })
    expect(result.detail).not.toContain('/nonexistent')
    state.close()
  })

  it('passes when the token file is readable, without reading it into output', async () => {
    const probe = await openTestState()
    const tokenFile = join(probe.dataDir, 'token')
    await writeFile(tokenFile, 'worker-secret-value')
    probe.close()
    const state = await openTestState({
      worker: { url: 'http://127.0.0.1:9', tokenFile },
    })
    const result = await checkWorkerToken(state)
    expect(result.level).toBe('ok')
    expect(JSON.stringify(result)).not.toContain('worker-secret-value')
    state.close()
  })
})
