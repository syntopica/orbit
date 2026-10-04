import { basename } from 'node:path'

import type { RunRequest } from '../types/RunRequest'

export const formatRunLine = (
  request: RunRequest,
  ms: number,
  outcome: string,
  concurrent: number,
): string =>
  `engine-run ${basename(request.file)} ${request.args[0] ?? '-'} ${String(Math.round(ms))}ms ${outcome} concurrent=${String(concurrent)}`
