import { existsSync, lstatSync, realpathSync } from 'node:fs'
import { join } from 'node:path'

// process.execPath is the resolved binary, which Homebrew keeps in a versioned
// Cellar directory and deletes on upgrade: on 2026-10-05 node 26.10.0_1 became
// _2 and both LaunchAgents failed to spawn (EX_CONFIG) at their next restart.
// A link on PATH to the same binary, such as /opt/homebrew/bin/node, survives.
export const stableNodePath = (
  nodePath: string,
  shellPath: string | undefined,
): string => {
  const real = realpathSync(nodePath)
  const link = (shellPath ?? '')
    .split(':')
    .filter((entry) => entry !== '')
    .map((entry) => join(entry, 'node'))
    .find(
      (candidate) =>
        existsSync(candidate) &&
        lstatSync(candidate).isSymbolicLink() &&
        realpathSync(candidate) === real,
    )
  return link ?? nodePath
}
