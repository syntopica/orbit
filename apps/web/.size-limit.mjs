import path from 'node:path'

import { entryClosure } from './size/entryClosure.mjs'

const root = '../server/dist/public'

export default [
  {
    name: 'initial route with its static imports (brotli)',
    path: entryClosure(path.join(import.meta.dirname, root)).map((file) =>
      path.posix.join(root, file),
    ),
    limit: '150 KB',
  },
  {
    name: '3D orbit chunk (brotli)',
    path: `${root}/assets/OrbitScene-*.js`,
    limit: '250 KB',
  },
  {
    name: 'flow route (brotli)',
    path: `${root}/assets/MemoryFlowScreen-*.js`,
    limit: '250 KB',
  },
  {
    name: 'brain route and layout worker (brotli)',
    path: [
      `${root}/assets/BrainScreen-*.js`,
      `${root}/assets/layoutWorker-*.js`,
    ],
    limit: '250 KB',
  },
]
