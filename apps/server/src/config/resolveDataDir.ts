import { isAbsolute } from 'node:path'

import { DataDirError } from './DataDirError'

export const resolveDataDir = (env: NodeJS.ProcessEnv): string => {
  const dir = env['SYNTOPICA_DATA']
  if (dir === undefined || !isAbsolute(dir)) throw new DataDirError()
  return dir
}
