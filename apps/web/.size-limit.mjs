import path from 'node:path'

import { entryClosure } from './size/entryClosure.mjs'
import { lazyClosure } from './size/lazyClosure.mjs'

const root = '../server/dist/public'
const built = path.join(import.meta.dirname, root)
const lazy = (name) =>
  lazyClosure(built, name).map((file) => path.posix.join(root, file))

export default [
  {
    name: 'initial route with its static imports (brotli)',
    path: entryClosure(built).map((file) => path.posix.join(root, file)),
    limit: '150 KB',
  },
  {
    name: '3D orbit chunk with three.js (brotli)',
    path: lazy('OrbitScene'),
    limit: '250 KB',
  },
  {
    name: '3D brain graph chunk with three.js (brotli)',
    path: lazy('GraphScene3d'),
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
