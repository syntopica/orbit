import { signalGroup } from './signalGroup'

export const killGroup = (pid: number, graceMs: number): void => {
  signalGroup(pid, 'SIGTERM')
  setTimeout(() => {
    signalGroup(pid, 'SIGKILL')
  }, graceMs).unref()
}
