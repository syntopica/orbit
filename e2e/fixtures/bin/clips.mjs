#!/usr/bin/env node
const docs = {
  'status --json': {
    schemaVersion: 1,
    total: 9,
    states: { pending: 3, 'needs-claude': 1 },
    oldestAt: { pending: '2026-10-01T00:00:00.000Z', 'needs-claude': null },
    intake: { days: [], undated: 0 },
  },
  'doctor --json': { schemaVersion: 1, ok: true, checks: [] },
}
const doc = docs[process.argv.slice(2).join(' ')]
if (doc === undefined) process.exit(64)
process.stdout.write(JSON.stringify(doc))
