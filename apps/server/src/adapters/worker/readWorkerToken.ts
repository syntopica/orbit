import { readFile } from 'node:fs/promises'

import { isPermissionDenied } from '../../fs/isPermissionDenied'
import { ProcessError } from '../../process/ProcessError'

// Read per call and never kept: the token must not outlive the request.
export const readWorkerToken = async (tokenFile: string): Promise<string> => {
  let text: string
  try {
    text = await readFile(tokenFile, 'utf8')
  } catch (error: unknown) {
    throw new ProcessError(
      isPermissionDenied(error) ? 'permission_denied' : 'not_found',
    )
  }
  const token = text.trim()
  if (token.length === 0) throw new ProcessError('unauthorized')
  return token
}
