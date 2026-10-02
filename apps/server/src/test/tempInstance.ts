import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const tempInstance = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-cli-'))
  await writeFile(
    join(dir, 'syntopica.config.json'),
    JSON.stringify({ schemaVersion: 1 }),
  )
  return dir
}
