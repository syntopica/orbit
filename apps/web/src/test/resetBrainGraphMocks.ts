import { vi } from 'vitest'

import { hasWebGl } from '../graph/hasWebGl'
import { fakeReactSigma } from './fakeReactSigma'

vi.mock(
  '@react-sigma/core',
  async () => (await import('./fakeReactSigma')).fakeReactSigma,
)
vi.mock(
  '../layout/createLayoutWorker',
  async () => (await import('./fakeLayoutWorkerModule')).fakeLayoutWorkerModule,
)
vi.mock('../graph/hasWebGl', () => ({ hasWebGl: vi.fn(() => true) }))

export const resetBrainGraphMocks = (): void => {
  fakeReactSigma.loaded.length = 0
  fakeReactSigma.goto.mockClear()
  fakeReactSigma.gotoNode.mockClear()
  vi.mocked(hasWebGl).mockReturnValue(true)
}
