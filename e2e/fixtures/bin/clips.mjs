#!/usr/bin/env node
const docs = {
  'status --json': {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    total: 9,
    states: {
      pending: 3,
      'needs-claude': 1,
      'reconciliation-pending': 1,
      reconciled: 4,
    },
    oldestAt: {
      pending: '2026-10-01T00:00:00.000Z',
      'needs-claude': null,
      'reconciliation-pending': null,
    },
    intake: {
      days: [1, 3, 2].map((count, index) => ({
        day: new Date(Date.now() - (2 - index) * 86_400_000)
          .toISOString()
          .slice(0, 10),
        count,
      })),
      undated: 1,
    },
  },
  'doctor --json': {
    schemaVersion: 1,
    ok: true,
    checks: [{ name: 'paths', ok: true, code: 'ok' }],
  },
}
const doc = docs[process.argv.slice(2).join(' ')]
if (doc === undefined) process.exit(64)
process.stdout.write(JSON.stringify(doc))
