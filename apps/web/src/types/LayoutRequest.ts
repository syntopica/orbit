// Indices only: the worker never needs page ids.
export type LayoutRequest = {
  readonly order: number
  readonly edges: readonly (readonly [number, number])[]
  readonly seed: number
}
