import { Canvas } from '@react-three/fiber'
import type { RefObject } from 'react'

import { useOrbitGlowTexture } from '../../hooks/useOrbitGlowTexture'
import type { CardModel } from '../../types/CardModel'
import { OrbitCamera } from './OrbitCamera'
import { OrbitCore } from './OrbitCore'
import { OrbitDust } from './OrbitDust'
import { OrbitLabelLayout } from './OrbitLabelLayout'
import { OrbitSatellites } from './OrbitSatellites'
import { OrbitTrack } from './OrbitTrack'

export const OrbitCanvas = ({
  cards,
  labels,
  leaders,
  visible,
}: {
  readonly cards: readonly CardModel[]
  readonly labels: readonly RefObject<HTMLAnchorElement | null>[]
  readonly leaders: readonly RefObject<SVGPathElement | null>[]
  readonly visible: boolean
}) => {
  const styles = getComputedStyle(document.documentElement)
  const accent = styles.getPropertyValue('--color-accent').trim()
  const light = matchMedia('(prefers-color-scheme: light)').matches
  const texture = useOrbitGlowTexture()
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 4.2, 8.2], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={1.2} />
      <OrbitCamera />
      <OrbitLabelLayout labels={labels} leaders={leaders} />
      <OrbitDust color={accent} light={light} />
      <OrbitCore color={accent} light={light} texture={texture} />
      <OrbitTrack radius={2.35} color={accent} />
      <OrbitTrack radius={3.85} color={accent} />
      <OrbitSatellites
        cards={cards}
        labels={labels}
        styles={styles}
        light={light}
        texture={texture}
      />
    </Canvas>
  )
}
