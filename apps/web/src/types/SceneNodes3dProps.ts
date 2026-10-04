import type { Scene3dPartProps } from './Scene3dPartProps'

export type SceneNodes3dProps = Scene3dPartProps & {
  readonly onHover: (id: string | null) => void
  readonly onSelect: (id: string) => void
}
