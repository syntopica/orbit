// Fixed provider-to-slot table: a provider keeps its colour whatever else is
// on screen. Anything unlisted (including `unknown`) is drawn as "other".
export const PROVIDER_SERIES_ORDER: readonly string[] = [
  'agy',
  'openrouter',
  'ollama',
  'codex',
  'cursor',
  'other',
]
