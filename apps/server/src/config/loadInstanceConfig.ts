import { join, resolve } from 'node:path'

import { readJsonFile } from '../fs/readJsonFile'
import type { InstanceConfig } from '../types/InstanceConfig'
import { instanceEnginesSchema } from './instanceEnginesSchema'

export const loadInstanceConfig = async (
  dataDir: string,
): Promise<InstanceConfig> => {
  const base = await readJsonFile(join(dataDir, 'syntopica.config.json'))
  if (base === undefined)
    throw new Error(`syntopica.config.json not found in ${dataDir}`)
  const local =
    (await readJsonFile(join(dataDir, 'syntopica.local.json'))) ?? {}
  const merged = {
    ...instanceEnginesSchema.parse(base).engines,
    ...instanceEnginesSchema.parse(local).engines,
  }
  const engines = Object.fromEntries(
    Object.entries(merged).map(([name, engine]) => [
      name,
      { path: resolve(dataDir, engine.path) },
    ]),
  )
  return { dataDir, engines }
}
