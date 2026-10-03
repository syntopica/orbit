import type { CLIPS_LABELS } from '../labels/clipsLabels'

export type FunnelGroupSpec = {
  readonly id: keyof typeof CLIPS_LABELS.groups
  readonly states: readonly string[]
}
