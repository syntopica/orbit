import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
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
  for (let i = 0; i < 200; i += 1) {
    try {
      const text = await readFile(path, 'utf8')
      if (text !== '') return text
    } catch {
      // Not written yet.
    }
    await sleep(50)
  }
  throw new Error('file never appeared')
}

const waitUntilGone = async (pid: number): Promise<void> => {
  for (let i = 0; i < 100 && alive(pid); i += 1) await sleep(100)
}

const dirs: string[] = []
const tempDir = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-run-'))
  dirs.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(
    dirs
      .splice(0)
      .map(async (dir) => rm(dir, { recursive: true, force: true })),
  )
  vi.restoreAllMocks()
})

describe('runProcess', () => {
  it('returns stdout and the exit code', async () => {
    await expect(
      node('process.stdout.write("ok"); process.exit(3)'),
    ).resolves.toEqual({ code: 3, stdout: 'ok' })
  })
  it('kills the whole process group on abort', async () => {
    const pidFile = join(await tempDir(), 'pid')
    const script = `
      const { spawn } = require('node:child_process')
      const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' })
      require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(child.pid))
      setInterval(() => {}, 1000)`
    const controller = new AbortController()
    const run = runProcess({
      file: process.execPath,
      args: ['-e', script],
      env: {},
      timeoutMs: 60_000,
      maxBytes: 10,
      signal: controller.signal,
    })
    const outcome = Promise.allSettled([run])
    const grandchild = Number(await waitForFile(pidFile))
    controller.abort()
    const [result] = await outcome
    expect(result.status === 'rejected' && result.reason).toBeInstanceOf(
      ProcessError,
    )
    await waitUntilGone(grandchild)
    expect(alive(grandchild)).toBe(false)
  }, 15_000)
  it('rejects on timeout without waiting for the pipe to close', async () => {
    await expect(
      node('setInterval(() => {}, 1000)', 300),
    ).rejects.toMatchObject({ reason: 'timeout' })
    await sleep(500)
  })
  it('stops a process that writes more than maxBytes and kills it', async () => {
    const pidFile = join(await tempDir(), 'pid')
    const script = `require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(process.pid))
      setInterval(() => process.stdout.write("x".repeat(512)), 1)`
    await expect(node(script, 5000, 2048)).rejects.toMatchObject({
      reason: 'output_too_large',
    })
    const pid = Number(await waitForFile(pidFile))
    await waitUntilGone(pid)
    expect(alive(pid)).toBe(false)
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
  it('does not report other spawn failures as not_found', async () => {
    await expect(
      runProcess({
        file: await tempDir(),
        args: [],
        env: {},
        timeoutMs: 1000,
        maxBytes: 10,
      }),
    ).rejects.toMatchObject({ reason: 'check_failed' })
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
  it('does not spawn when already aborted', async () => {
    const marker = join(await tempDir(), 'marker')
    const script = `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'x')`
    await expect(
      runProcess({
        file: process.execPath,
        args: ['-e', script],
        env: {},
        timeoutMs: 1000,
        maxBytes: 10,
        signal: AbortSignal.abort(),
      }),
    ).rejects.toMatchObject({ reason: 'timeout' })
    await sleep(500)
    expect(existsSync(marker)).toBe(false)
  })
  it('leaves no listener and signals nothing when aborted after completion', async () => {
    const controller = new AbortController()
    const add = vi.spyOn(controller.signal, 'addEventListener')
    const remove = vi.spyOn(controller.signal, 'removeEventListener')
    const kill = vi.spyOn(process, 'kill')
    const result = await runProcess({
      file: process.execPath,
      args: ['-e', 'process.stdout.write("ok")'],
      env: {},
      timeoutMs: 5000,
      maxBytes: 10,
      signal: controller.signal,
    })
    expect(result).toEqual({ code: 0, stdout: 'ok' })
    expect(add).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0]?.[1])
    expect(() => {
      controller.abort()
    }).not.toThrow()
    expect(kill).not.toHaveBeenCalled()
  })
  it('reports -1 when the child dies from a signal', async () => {
    await expect(node('process.kill(process.pid, "SIGKILL")')).resolves.toEqual(
      { code: -1, stdout: '' },
    )
  })
})
