// An undirected link between two drawn nodes; `size` grows with the links
// it stands for when it joins two communities.
export type SceneEdge = {
  readonly source: string
  readonly target: string
  readonly size: number
}
