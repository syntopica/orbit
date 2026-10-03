import { open } from 'node:fs/promises'

import type { z } from 'zod'

import { parseEngineDocument } from '../../engines/parseEngineDocument'
import { isNotFound } from '../../fs/isNotFound'
import { isPermissionDenied } from '../../fs/isPermissionDenied'
import { ProcessError } from '../../process/ProcessError'

// A status file is published atomically by its one writer, so a read never
// sees partial JSON; absent means that job has not finished a run yet. The
// size is checked on the open handle before a byte is read.
export const readStatusFile = async <T>(
  path: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T | null> => {
  let text: string
  try {
    const handle = await open(path, 'r')
    try {
      if ((await handle.stat()).size > 1_048_576) {
        throw new ProcessError('output_too_large')
      }
      text = await handle.readFile({ encoding: 'utf8', signal })
    } finally {
      await handle.close()
    }
  } catch (error) {
    if (error instanceof ProcessError) throw error
    if (isNotFound(error)) return null
    if (signal.aborted) throw error
    throw new ProcessError(
      isPermissionDenied(error) ? 'permission_denied' : 'check_failed',
    )
  }
  if (text.length > 1_048_576) throw new ProcessError('output_too_large')
  return parseEngineDocument({ code: 0, stdout: text }, schema)
}
