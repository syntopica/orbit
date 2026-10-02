import type { HealthRingProps } from '../../types/HealthRingProps'

export const HealthRing = ({ state, greyed }: HealthRingProps) => (
  <circle
    r={34}
    data-testid="ring"
    data-state={state}
    className="fill-panel data-[state=down]:stroke-down data-[state=ok]:stroke-ok data-[state=warn]:stroke-warn stroke-3"
    opacity={greyed ? 0.5 : 1}
  />
)
