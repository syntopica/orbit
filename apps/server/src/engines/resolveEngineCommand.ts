import { access, constants } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

import { ProcessError } from '../process/ProcessError'

// Resolved once at start; a missing or non-executable file is not_found.
export const resolveEngineCommand = async (
  checkout: string,
  command: string,
): Promise<string> => {
  const file = isAbsolute(command) ? command : join(checkout, command)
  const runnable = await access(file, constants.X_OK).then(
    () => true,
    () => false,
  )
  if (!runnable) throw new ProcessError('not_found')
  return file
}
