export const CONTEXT_LABELS = {
  title: 'Context inspector',
  intro:
    'What a session would receive for a query: every lane of words, across projects.',
  query: 'Query',
  submit: 'Inspect',
  characters: 'characters',
  loading: 'Running atrium context',
  empty: 'No evidence for this query.',
  blocks: 'Blocks',
  of: 'of',
  limit: 'limit',
  freshness: 'Index',
  warnings: 'Warnings',
  chars: 'chars',
  truncated: 'truncated',
  trust: { curated: 'Curated', history: 'History' },
  errors: {
    bad_request: 'Enter 1 to 500 characters without control characters.',
    rate_limited: 'Too many queries; wait a minute.',
    unavailable: 'Could not run atrium context.',
    engine_schema_unsupported: 'Atrium answered in an unsupported version.',
  },
} as const
