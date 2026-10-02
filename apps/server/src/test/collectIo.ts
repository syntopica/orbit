import type { CliIo } from '../types/CliIo'

// A CliIo that records every line, in order, per stream.
export const collectIo = (
  env: NodeJS.ProcessEnv,
): { io: CliIo; out: string[]; err: string[] } => {
  const out: string[] = []
  const err: string[] = []
  return {
    io: { out: (l) => out.push(l), err: (l) => err.push(l), env },
    out,
    err,
  }
}
