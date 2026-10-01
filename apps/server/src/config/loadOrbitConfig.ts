import { join } from 'node:path'

import { readJsonFile } from '../fs/readJsonFile'
import type { OrbitConfig } from '../types/OrbitConfig'
import { orbitConfigSchema } from './orbitConfigSchema'

export const loadOrbitConfig = async (dataDir: string): Promise<OrbitConfig> =>
  orbitConfigSchema.parse(
    (await readJsonFile(join(dataDir, 'orbit', 'orbit.json'))) ?? {},
  )
