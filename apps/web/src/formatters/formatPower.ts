import { POWER_LABELS } from '../labels/powerLabels'

export const formatPower = (onAc: boolean | null): string => {
  if (onAc === null) return POWER_LABELS.unknown
  return onAc ? POWER_LABELS.ac : POWER_LABELS.battery
}
