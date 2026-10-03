#!/usr/bin/env node
// Fixture brain engine: fixed documents keyed by the exact argument list.
const doctor = { schemaVersion: 1, ok: true, checks: [] }
const docs = {
  'lint --json': {
    schemaVersion: 1,
    pageCount: 3,
    indexStale: false,
    issues: [{ page: 'notes/a', code: 'dangling_link' }],
  },
  'doctor --json': doctor,
  'doctor --json --skip credentials': doctor,
  'graph --json --no-html': {
    schemaVersion: 1,
    nodes: [
      { id: 'notes/a', type: 'topic', degree: 1 },
      { id: 'notes/b', type: 'topic', degree: 2 },
      { id: 'notes/c', type: 'project', degree: 1 },
    ],
    edges: [
      { source: 'notes/b', target: 'notes/a' },
      { source: 'notes/c', target: 'notes/b' },
    ],
    orphans: ['notes/c'],
    dangling: [{ page: 'notes/a', target: 'notes/gone' }],
  },
  'graph --json --related --limit 50': {
    schemaVersion: 1,
    total: 1,
    pairs: [{ left: 'notes/a', right: 'notes/c', score: 2.5 }],
  },
  'page --json --id notes/a': {
    schemaVersion: 1,
    id: 'notes/a',
    frontmatter: {
      title: 'Fixture page A',
      type: 'topic',
      updated: '2026-10-01',
      summary: 'A fixture page.',
      sources: [],
      secret_note: 'never forwarded',
    },
    body: '# Overview\n\nLinks to [[notes/gone]] and nothing else.\n\n<script>alert(1)</script>',
    truncated: false,
    links: {
      outbound: [{ target: 'notes/gone', exists: false }],
      inbound: ['notes/b'],
    },
  },
}
const key = process.argv.slice(2).join(' ')
const doc = docs[key]
if (doc !== undefined) {
  process.stdout.write(JSON.stringify(doc))
} else if (key.startsWith('page --json --id ')) {
  process.stdout.write(
    JSON.stringify({ schemaVersion: 1, error: 'page_not_found' }),
  )
  process.exit(1)
} else {
  process.exit(64)
}
