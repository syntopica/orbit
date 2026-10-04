#!/usr/bin/env node
const args = process.argv.slice(2)
if (args[0] === 'action') {
  process.stdout.write('PRIVATE ENGINE OUTPUT')
  process.exit(args[1] === 'failure' ? 1 : 0)
}
await import('../fixtures/bin/brain.mjs')
