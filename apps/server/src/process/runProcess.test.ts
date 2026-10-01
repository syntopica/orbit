import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ProcessError } from './ProcessError'
import { runProcess } from './runProcess'

const node = async (script: string, timeoutMs = 5000, maxBytes = 1024) =>
  runProcess({
    file: process.execPath,
    args: ['-e', script],
    env: {},
    timeoutMs,
    maxBytes,
  })

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const alive = (pid: number): boolean => {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

const waitForFile = async (path: string): Promise<string> => {
  for (let i = 0; i < 100; i += 1) {
    try {
      const text = await readFile(path, 'utf8')
      if (text !== '') return text
    } catch {
      // Not written yet.
    }
    await sleep(50)
  }
  throw new Error('pid file never appeared')
}

describe('runProcess', () => {
  it('returns stdout and the exit code', async () => {
    await expect(
      node('process.stdout.write("ok"); process.exit(3)'),
    ).resolves.toEqual({ code: 3, stdout: 'ok' })
  })
  it('kills the whole process group on timeout', async () => {
    const pidFile = join(await mkdtemp(join(tmpdir(), 'orbit-run-')), 'pid')
    const script = `
      const { spawn } = require('node:child_process')
      const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
      require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(child.pid))
      setInterval(() => {}, 1000)`
    const run = node(script, 1500)
    const grandchild = Number(await waitForFile(pidFile))
    await expect(run).rejects.toThrow(ProcessError)
    for (let i = 0; i < 100 && alive(grandchild); i += 1) await sleep(100)
    expect(alive(grandchild)).toBe(false)
  }, 15_000)
  it('stops a process that writes more than maxBytes', async () => {
    await expect(
      node(
        'setInterval(() => process.stdout.write("x".repeat(512)), 1)',
        5000,
        2048,
      ),
    ).rejects.toMatchObject({
      reason: 'output_too_large',
    })
  })
  it('reports a missing executable as not_found', async () => {
    await expect(
      runProcess({
        file: '/nonexistent/orbit-cli',
        args: [],
        env: {},
        timeoutMs: 1000,
        maxBytes: 10,
      }),
    ).rejects.toMatchObject({ reason: 'not_found' })
  })
  it('stops when the caller aborts', async () => {
    const controller = new AbortController()
    const run = runProcess({
      file: process.execPath,
      args: ['-e', 'setInterval(() => {}, 1000)'],
      env: {},
      timeoutMs: 10_000,
      maxBytes: 10,
      signal: controller.signal,
    })
    controller.abort()
    await expect(run).rejects.toMatchObject({ reason: 'timeout' })
  })
  it('rejects at once when already aborted', async () => {
    await expect(
      runProcess({
        file: process.execPath,
        args: [],
        env: {},
        timeoutMs: 1000,
        maxBytes: 10,
        signal: AbortSignal.abort(),
      }),
    ).rejects.toMatchObject({ reason: 'timeout' })
  })
  it('reports -1 when the child dies from a signal', async () => {
    await expect(node('process.kill(process.pid, "SIGKILL")')).resolves.toEqual(
      { code: -1, stdout: '' },
    )
  })
  it('keeps the first failure when a second one follows', async () => {
    const controller = new AbortController()
    const run = runProcess({
      file: process.execPath,
      args: [
        '-e',
        'setInterval(() => process.stdout.write("x".repeat(512)), 1)',
      ],
      env: {},
      timeoutMs: 5000,
      maxBytes: 100,
      signal: controller.signal,
    })
    await expect(
      run.finally(() => {
        controller.abort()
      }),
    ).rejects.toMatchObject({
      reason: 'output_too_large',
    })
  })
})
