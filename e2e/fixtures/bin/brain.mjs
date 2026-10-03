#!/usr/bin/env node
const docs = {
  'lint --json': {
    schemaVersion: 1,
    pageCount: 12,
    indexStale: false,
    issues: [{ page: 'notes/a', code: 'dangling_link' }],
  },
  'doctor --json': { schemaVersion: 1, ok: true, checks: [] },
}
const doc = docs[process.argv.slice(2).join(' ')]
if (doc === undefined) process.exit(64)
process.stdout.write(JSON.stringify(doc))
