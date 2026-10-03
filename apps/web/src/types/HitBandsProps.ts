import type { HitBand } from './HitBand'

export type HitBandsProps = {
  readonly bands: readonly HitBand[]
  readonly height: number
  readonly onShow: (index: number) => void
}
