import { isAbsolute } from 'node:path'

export const resolveDataDir = (env: NodeJS.ProcessEnv): string => {
  const dir = env['SYNTOPICA_DATA']
  if (dir === undefined || !isAbsolute(dir)) {
    throw new Error('SYNTOPICA_DATA must be set to an absolute path')
  }
  return dir
}
