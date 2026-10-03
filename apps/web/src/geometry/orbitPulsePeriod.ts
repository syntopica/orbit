import type { ComponentId } from '@orbit/contract'

export const orbitPulsePeriod = (component: ComponentId): number => {
  if (component === 'synthetic') return 1000
  if (component === 'worker') return 5000
  if (component === 'launchd') return 10_000
  if (component === 'capture') return 120_000
  return 60_000
}
