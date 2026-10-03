import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, Sprite } from 'three'
import { Vector3 } from 'three'

import { orbitPosition3d } from '../geometry/orbitPosition3d'
import { updateOrbitWave } from '../geometry/updateOrbitWave'
import type { CardModel } from '../types/CardModel'

export const useOrbitSatellite3d = (
  card: CardModel,
  index: number,
  light: boolean,
) => {
  const group = useRef<Group>(null)
  const sphere = useRef<Mesh>(null)
  const halo = useRef<Sprite>(null)
  const wave = useRef<Mesh>(null)
  const hoveredRef = useRef(false)
  const point = useMemo(() => new Vector3(), [])
  useFrame(({ camera, clock }) => {
    point.set(...orbitPosition3d(index, clock.elapsedTime * 0.055))
    group.current?.position.copy(point)
    const haloScale = hoveredRef.current ? 1.25 : 0.95
    halo.current?.scale.set(haloScale, haloScale, 1)
    updateOrbitWave(wave.current, camera, card, light)
    if (sphere.current)
      sphere.current.scale.setScalar(hoveredRef.current ? 1.3 : 1)
  })
  return { group, sphere, halo, wave, hoveredRef }
}
