// Index-aligned arrays over the graph route's nodes (spec 7.5).
export type GraphModel = {
  readonly ids: readonly string[]
  readonly types: readonly string[]
  readonly degree: readonly number[]
  readonly orphan: readonly boolean[]
  readonly edges: readonly (readonly [number, number])[]
  readonly neighbours: readonly (readonly number[])[]
  readonly typeNames: readonly string[]
  readonly indexOf: ReadonlyMap<string, number>
}
