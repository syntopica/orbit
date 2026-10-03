import type { RunRequest } from '../types/RunRequest'
import { createEngineRunner } from './createEngineRunner'

const engine = {
  file: '/opt/engine/bin/tool',
  subcommands: [
    ['lint', '--json'],
    ['doctor', '--json', '--skip', 'credentials'],
  ],
  env: { EXTRA: '1' },
}

describe('createEngineRunner', () => {
  it('runs a listed subcommand with the engine env and fixed limits', async () => {
    const seen: RunRequest[] = []
    const run = createEngineRunner(engine, async (request) => {
      seen.push(request)
      return await Promise.resolve({ code: 0, stdout: '{}' })
    })
    await run(['lint', '--json'], new AbortController().signal)
    expect(seen[0]).toMatchObject({
      file: '/opt/engine/bin/tool',
      args: ['lint', '--json'],
      timeoutMs: 10_000,
      maxBytes: 8 * 1024 * 1024,
    })
    expect(seen[0]?.env['EXTRA']).toBe('1')
  })
  it('runs the full listed entry for a leading request', async () => {
    const seen: RunRequest[] = []
    const run = createEngineRunner(engine, async (request) => {
      seen.push(request)
      return await Promise.resolve({ code: 0, stdout: '{}' })
    })
    await run(['doctor', '--json'], new AbortController().signal)
    expect(seen[0]?.args).toEqual(['doctor', '--json', '--skip', 'credentials'])
  })
  it('refuses a subcommand the table does not list', async () => {
    const run = createEngineRunner(engine, () => {
      throw new Error('must not run')
    })
    await expect(
      run(['index'], new AbortController().signal),
    ).rejects.toMatchObject({ reason: 'check_failed' })
  })
})
