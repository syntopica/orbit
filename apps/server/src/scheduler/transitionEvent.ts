import type { Health, OrbitEvent, SnapshotCore } from '@orbit/contract'

export const transitionEvent = (
  previous: Health | null,
  next: SnapshotCore,
): OrbitEvent | null => {
  const wasDown = previous?.state === 'down'
  const isDown = next.health.state === 'down'
  if (wasDown === isDown) return null
  return {
    at: next.observedAt,
    component: next.component,
    kind: isDown ? 'component.down' : 'component.recovered',
    severity: isDown ? 'error' : 'info',
    refs:
      isDown && next.health.reason !== null
        ? { reason: next.health.reason }
        : {},
  }
}
