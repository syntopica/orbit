// Resolved colour values: WebGL cannot read CSS variables.
export type GraphPalette = {
  readonly scheme: 'light' | 'dark'
  readonly series: readonly string[]
  readonly warn: string
  readonly accent: string
  readonly line: string
  readonly ink: string
}
