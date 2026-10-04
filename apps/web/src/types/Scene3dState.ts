import type { Scene3dPartProps } from './Scene3dPartProps'

export type Scene3dState = {
  readonly part: Scene3dPartProps
  readonly hover: (id: string | null) => void
}
