import type { Scene3dPartProps } from './Scene3dPartProps'

export type Scene3dState = {
  readonly part: Scene3dPartProps
  readonly extent: number
  readonly hover: (id: string | null) => void
}
