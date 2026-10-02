import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const webRootWithIndex = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'orbit-web-'))
  await writeFile(join(dir, 'index.html'), '<!doctype html>')
  return dir
}
