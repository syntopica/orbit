// The argument list orbit requests; the engine table must list it with
// `{jobKey}` last, filled only with a 32-hex registry key.
export const ATRIUM_SHOW_ARGS = [
  'synthesis',
  'show',
  '--json',
  '--job-key',
] as const
