import type { Ref } from 'react'
import type { Sprite, Texture } from 'three'

export type OrbitGlowProps = {
  readonly color: string
  readonly light: boolean
  readonly opacity: number
  readonly ref?: Ref<Sprite> | null
  readonly scale: number
  readonly texture: Texture
}
