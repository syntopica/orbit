// The argument list orbit requests; the engine table must list it with
// `{query}` last. `--lane words` keeps the run inside the spec 4 budget, and
// `--` keeps a query that looks like an option a positional argument.
export const ATRIUM_CONTEXT_ARGS = [
  'context',
  '--json',
  '--lane',
  'words',
  '--',
] as const
