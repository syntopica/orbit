import { chmod, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// An executable shell script in a fresh directory; returns its path.
export const writeFakeBin = async (
  name: string,
  body: string,
): Promise<string> => {
  const path = join(await mkdtemp(join(tmpdir(), 'orbit-bin-')), name)
  await writeFile(path, `#!/bin/sh\n${body}\n`)
  await chmod(path, 0o755)
  return path
}
