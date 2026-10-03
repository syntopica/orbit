import type { Camera, Mesh, MeshBasicMaterial } from 'three'

import type { CardModel } from '../types/CardModel'
import { orbitPulsePeriod } from './orbitPulsePeriod'

export const updateOrbitWave = (
  wave: Mesh | null,
  camera: Camera,
  card: CardModel,
  light: boolean,
): void => {
  if (!wave) return
  const period = orbitPulsePeriod(card.component)
  const phase = ((Date.now() - Date.parse(card.observedAt)) % period) / period
  wave.quaternion.copy(camera.quaternion)
  wave.scale.setScalar(1 + phase * 2)
  const material = wave.material as MeshBasicMaterial
  material.opacity = card.greyed
    ? 0
    : (1 - phase) ** 2 *
      (light ? 0.32 : 0.55) *
      (card.state === 'ok' ? 0.55 : 1)
}
