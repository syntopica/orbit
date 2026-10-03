import { dirname } from 'node:path'

// launchd starts orbit with a bare PATH, so the plist carries the one orbit's
// engine commands need: the running node's directory, then the installing
// shell's entries.
export const buildLaunchdPath = (
  nodePath: string,
  shellPath: string | undefined,
): string => {
  const entries = (
    shellPath === undefined || shellPath === ''
      ? '/usr/bin:/bin:/usr/sbin:/sbin'
      : shellPath
  ).split(':')
  return [...new Set([dirname(nodePath), ...entries])]
    .filter((entry) => entry !== '')
    .join(':')
}
