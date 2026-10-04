import { basename } from 'node:path'

import type { RunLine } from '../types/RunLine'
import type { RunRequest } from '../types/RunRequest'

export const formatRunLine = (request: RunRequest, line: RunLine): string =>
  [
    'engine-run',
    basename(request.file),
    request.args[0] ?? '-',
    `${String(Math.round(line.ms))}ms`,
    line.outcome,
    `concurrent=${String(line.concurrent)}`,
    `load=${line.load.toFixed(1)}`,
  ].join(' ')
