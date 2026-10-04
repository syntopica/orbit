// The leading arguments orbit requests; `--limit` and `--days` come from the
// engine table's entry, never from the caller (spec 5.3).
export const ATRIUM_RECENT_ARGS = ['synthesis', 'recent', '--json'] as const
