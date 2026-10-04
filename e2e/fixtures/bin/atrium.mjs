#!/usr/bin/env node
// Fixture atrium engine: `context --json --lane words -- <query>` only.
const [command, ...rest] = process.argv.slice(2)
const fixed = ['--json', '--lane', 'words', '--']
const query = rest[fixed.length]
if (
  command !== 'context' ||
  rest.length !== fixed.length + 1 ||
  fixed.some((arg, index) => rest[index] !== arg)
) {
  process.exit(64)
}
const evidence =
  query === 'nothing'
    ? []
    : [
        {
          record_id: 'r1',
          text: 'Placeholder curated note about the example project.',
          score: 4.2,
          lane: 'words',
          trust: 'curated',
          role: 'note',
          provider: 'brain',
          conversation_id: 'notes/example.md',
          note_path: 'notes/example.md',
          authored_at: null,
          truncated: false,
        },
        {
          record_id: 'r2',
          text: 'Placeholder history excerpt.',
          score: 2.1,
          lane: 'words',
          trust: 'history',
          role: 'assistant',
          provider: 'source-a',
          conversation_id: '00000000-0000-4000-8000-000000000000',
          note_path: null,
          authored_at: '2026-10-01T10:00:00+00:00',
          truncated: true,
        },
      ]
process.stdout.write(
  JSON.stringify({
    schemaVersion: 1,
    query,
    evidence,
    freshness: { status: 'fresh' },
    warnings: evidence.length === 0 ? [] : ['lexical_budget_exhausted'],
    limit: 8,
    max_chars: 16000,
    text_chars: evidence.reduce((sum, item) => sum + item.text.length, 0),
  }),
)
