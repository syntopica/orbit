import type { ReasonCode } from '@orbit/contract'
import { spawn } from 'node:child_process'

import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { killGroup } from './killGroup'
import { ProcessError } from './ProcessError'

export const runProcess = async (request: RunRequest): Promise<RunResult> =>
  new Promise((resolve, reject) => {
    if (request.signal?.aborted === true) {
      reject(new ProcessError('timeout'))
      return
    }
    const child = spawn(request.file, [...request.args], {
      env: request.env,
      detached: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const chunks: Buffer[] = []
    let size = 0
    let failure: ReasonCode | null = null
    const fail = (reason: ReasonCode): void => {
      if (failure !== null) return
      failure = reason
      if (child.pid !== undefined) killGroup(child.pid, 5000)
    }
    const timer = setTimeout(() => {
      fail('timeout')
    }, request.timeoutMs)
    request.signal?.addEventListener(
      'abort',
      () => {
        fail('timeout')
      },
      { once: true },
    )
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > request.maxBytes) fail('output_too_large')
      else chunks.push(chunk)
    })
    child.on('error', () => {
      clearTimeout(timer)
      reject(new ProcessError('not_found'))
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (failure === null)
        resolve({
          code: code ?? -1,
          stdout: Buffer.concat(chunks).toString('utf8'),
        })
      else reject(new ProcessError(failure))
    })
  })
