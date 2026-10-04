import type { WatchDeps } from '../types/WatchDeps'
import { WATCH_RESTART_AFTER } from './watchRestartAfter'

// One watcher pass. Returns 0 while orbit answers or is merely late, 1 when a
// restart was needed (so launchd's last exit shows it).
export const runWatch = async (deps: WatchDeps): Promise<number> => {
  if (await deps.probe()) {
    await deps.writeCount(0)
    return 0
  }
  const count = (await deps.readCount()) + 1
  if (count < WATCH_RESTART_AFTER) {
    await deps.writeCount(count)
    deps.log(`orbit-watch no answer (${String(count)} in a row)`)
    return 0
  }
  await deps.writeCount(0)
  const restarted = await deps.restart()
  deps.log(
    `orbit-watch no answer (${String(count)} in a row), ${restarted ? 'restarted' : 'restart failed'}`,
  )
  return 1
}
