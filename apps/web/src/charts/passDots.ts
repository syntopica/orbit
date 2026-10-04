import type { AtriumPass } from '@orbit/contract'

// Status colours for a pass, always shown beside its state in words.
export const PASS_DOTS: Record<AtriumPass['state'], string> = {
  ok: 'bg-ok',
  timeout: 'bg-warn',
  killed: 'bg-warn',
  failed: 'bg-down',
  interrupted: 'bg-unknown',
  running: 'bg-unknown',
}
