import type { AtriumPass, AtriumPasses } from '@orbit/contract'

// The newest pass that logged an exit status; a running pass has none yet.
export const selectEndedPass = (passes: AtriumPasses): AtriumPass | null =>
  passes.passes.find((pass) => pass.exitCode !== null) ?? null
