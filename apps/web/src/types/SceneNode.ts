// One drawn node: a page, or a collapsed community in the overview.
export type SceneNode = {
  readonly id: string
  readonly label: string
  readonly x: number
  readonly y: number
  readonly size: number
  readonly color: string
  readonly forceLabel: boolean
}
