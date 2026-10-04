import type Graph from 'graphology'
import type { ReactNode } from 'react'
import type { Coordinates } from 'sigma/types'
import { vi } from 'vitest'
import type { GraphEdgeAttributes } from '../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../types/GraphNodeAttributes'

// Mock only Sigma's React boundary; graph data and layouts remain real.
export const fakeReactSigma = {
  loaded: [] as Graph<GraphNodeAttributes, GraphEdgeAttributes>[],
  handlers: {} as Record<
    string,
    ((event: { node: string }) => void) | undefined
  >,
  goto: vi.fn(),
  container: document.createElement('div'),
  SigmaContainer: ({ children }: { readonly children?: ReactNode }) => (
    <div data-testid="sigma">{children}</div>
  ),
  loadGraph: (graph: Graph<GraphNodeAttributes, GraphEdgeAttributes>) => {
    fakeReactSigma.loaded.push(graph)
  },
  register: (handlers: Record<string, (event: { node: string }) => void>) => {
    Object.assign(fakeReactSigma.handlers, handlers)
  },
  useLoadGraph: () => fakeReactSigma.loadGraph,
  useRegisterEvents: () => fakeReactSigma.register,
  useCamera: () => ({
    goto: fakeReactSigma.goto,
  }),
  sigma: {
    getGraph: () => fakeReactSigma.loaded.at(-1),
    getContainer: () => fakeReactSigma.container,
    setSetting: vi.fn(),
    getDimensions: () => ({ width: 800, height: 600 }),
    graphToViewport: (point: Coordinates) => ({
      x: point.x * 600 + 400,
      y: 300 - point.y * 600,
    }),
    viewportToFramedGraph: (point: Coordinates) => ({
      x: (point.x - 400) / 600,
      y: (300 - point.y) / 600,
    }),
  },
  useSigma: () => fakeReactSigma.sigma,
}
