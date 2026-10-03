import type { ComponentId } from '@orbit/contract'

export const orbitDestination = (
  component: ComponentId,
): '/' | '/worker' | '/system' => {
  if (component === 'worker') return '/worker'
  if (component === 'launchd') return '/system'
  return '/'
}
