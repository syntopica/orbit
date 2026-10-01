import { type ChildProcessByStdio, spawn } from 'node:child_process'
import type { Readable } from 'node:stream'

import type { RunRequest } from '../types/RunRequest'

export const spawnGroup = (
  request: RunRequest,
): ChildProcessByStdio<null, Readable, null> =>
  spawn(request.file, [...request.args], {
    env: request.env,
    detached: true,
    shell: false,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
