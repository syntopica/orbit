import type { ReasonCode } from '@orbit/contract'

import type { RunRequest } from '../types/RunRequest'
import type { RunResult } from '../types/RunResult'
import { collectOutput } from './collectOutput'
import { killGroup } from './killGroup'
import { ProcessError } from './ProcessError'
import { spawnGroup } from './spawnGroup'

export const runProcess = async (request: RunRequest): Promise<RunResult> =>
  new Promise((resolve, reject) => {
    if (request.signal?.aborted === true) {
      reject(new ProcessError('timeout'))
      return
    }
    const child = spawnGroup(request)
    let settled = false
    const onAbort = (): void => {
      stop('timeout')
    }
    const timer = setTimeout(onAbort, request.timeoutMs)
    const finish = (action: () => void): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      request.signal?.removeEventListener('abort', onAbort)
      action()
    }
    const stop = (reason: ReasonCode): void => {
      finish(() => {
        if (child.pid !== undefined) killGroup(child.pid, 5000)
        child.stdout.destroy()
        reject(new ProcessError(reason))
      })
    }
    request.signal?.addEventListener('abort', onAbort, { once: true })
    const output = collectOutput(child.stdout, request.maxBytes, () => {
      stop('output_too_large')
    })
    child.on('error', (error: NodeJS.ErrnoException) => {
      finish(() => {
        const reason = error.code === 'ENOENT' ? 'not_found' : 'check_failed'
        reject(new ProcessError(reason))
      })
    })
    child.on('close', (code) => {
      finish(() => {
        resolve({ code: code ?? -1, stdout: output() })
      })
    })
  })
