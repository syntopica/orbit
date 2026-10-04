import type { AtriumSynthesisRow } from '@orbit/contract'

export type SynthesisRowProps = {
  readonly row: AtriumSynthesisRow
  readonly open: boolean
  readonly onToggle: () => void
}
