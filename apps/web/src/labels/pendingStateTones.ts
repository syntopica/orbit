// Badge border and text per pending state; the label is always shown too.
export const PENDING_STATE_TONES: Readonly<Record<string, string>> = {
  blocked: 'border-down/60 text-down',
  failed: 'border-down/60 text-down',
  partial: 'border-warn/60 text-warn',
  issue: 'border-warn/60 text-warn',
  open: 'border-line text-muted',
  waiting: 'border-line text-muted',
}
