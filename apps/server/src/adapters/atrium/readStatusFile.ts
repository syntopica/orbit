import { readFile } from 'node:fs/promises'

import type { z } from 'zod'

import { parseEngineDocument } from '../../engines/parseEngineDocument'
import { isNotFound } from '../../fs/isNotFound'
import { ProcessError } from '../../process/ProcessError'

// A status file is published atomically by its one writer, so a read never
// sees partial JSON; absent means that job has not finished a run yet.
export const readStatusFile = async <T>(
  path: string,
  schema: z.ZodType<T>,
  signal: AbortSignal,
): Promise<T | null> => {
  let text: string
  try {
    text = await readFile(path, { encoding: 'utf8', signal })
  } catch (error) {
    if (isNotFound(error)) return null
    if (signal.aborted) throw error
    throw new ProcessError('check_failed')
  }
  if (text.length > 1_048_576) throw new ProcessError('output_too_large')
  return parseEngineDocument({ code: 0, stdout: text }, schema)
}
