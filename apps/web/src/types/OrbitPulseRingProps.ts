import type { Ref } from 'react'
import type { Mesh } from 'three'

export type OrbitPulseRingProps = {
  readonly color: string
  readonly ref: Ref<Mesh>
}
