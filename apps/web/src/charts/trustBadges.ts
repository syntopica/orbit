import type { AtriumTrust } from '@orbit/contract'

// Badge colours per provenance: curated stands out, third-party saved content
// is flagged, everything else is a plain outline.
export const TRUST_BADGES: Record<AtriumTrust, string> = {
  curated: 'bg-accent text-space',
  history: 'border-line text-ink border',
  synthesized: 'border-line text-ink border',
  untrusted: 'bg-warn text-space',
  unknown: 'border-line text-muted border',
}
