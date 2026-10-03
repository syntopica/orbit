// Mark colours only; text never wears them. `failed` is the reserved status
// colour and always appears with its label in the legend.
export const ACTIVITY_FILLS: Readonly<Record<string, string>> = {
  agy: 'fill-series-1',
  openrouter: 'fill-series-2',
  ollama: 'fill-series-3',
  codex: 'fill-series-4',
  cursor: 'fill-series-5',
  other: 'fill-series-6',
  failed: 'fill-down',
}
