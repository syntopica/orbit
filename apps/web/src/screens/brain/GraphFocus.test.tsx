import { render } from '@testing-library/react'
import Graph from 'graphology'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fakeReactSigma } from '../../test/fakeReactSigma'
import type { GraphEdgeAttributes } from '../../types/GraphEdgeAttributes'
import type { GraphNodeAttributes } from '../../types/GraphNodeAttributes'
import { GraphFocus } from './GraphFocus'

vi.mock(
  '@react-sigma/core',
  async () => (await import('../../test/fakeReactSigma')).fakeReactSigma,
)

const graphOf = () => {
  const graph = new Graph<GraphNodeAttributes, GraphEdgeAttributes>()
  const attributes = { label: 'page', size: 3, color: '#fff', hidden: false }
  graph.addNode('notes/a', { ...attributes, x: 0.2, y: 0.2 })
  graph.addNode('notes/b', { ...attributes, x: 0.4, y: 0.6 })
  graph.addNode('notes/c', { ...attributes, x: 10, y: 10, hidden: true })
  fakeReactSigma.loaded.push(graph)
  return graph
}

beforeEach(() => {
  fakeReactSigma.loaded.length = 0
  fakeReactSigma.goto.mockClear()
  fakeReactSigma.gotoNode.mockClear()
})

describe('GraphFocus', () => {
  it('fits visible global positions instead of centring only the selected node', () => {
    render(<GraphFocus graph={graphOf()} id="notes/a" depth={1} animate />)
    expect(fakeReactSigma.goto).toHaveBeenCalledWith(
      { x: 0.3, y: 0.4, ratio: 0.5, angle: 0 },
      { duration: 300 },
    )
    expect(fakeReactSigma.gotoNode).not.toHaveBeenCalled()
  })
  it('refits on filters and depth changes without animating reduced motion', () => {
    const graph = graphOf()
    const view = render(
      <GraphFocus graph={graph} id="notes/a" depth={2} animate={false} />,
    )
    expect(fakeReactSigma.goto).toHaveBeenLastCalledWith(expect.any(Object), {
      duration: 0,
    })
    const filtered = graph.copy()
    filtered.setNodeAttribute('notes/b', 'hidden', true)
    fakeReactSigma.loaded.push(filtered)
    view.rerender(
      <GraphFocus graph={filtered} id="notes/a" depth={3} animate={false} />,
    )
    expect(fakeReactSigma.goto).toHaveBeenLastCalledWith(
      { x: 0.2, y: 0.2, ratio: 0.1, angle: 0 },
      { duration: 0 },
    )
  })
  it('follows the whole-graph selection and ignores absent pages', () => {
    const graph = graphOf()
    const view = render(
      <GraphFocus graph={graph} id="notes/a" depth={0} animate={false} />,
    )
    expect(fakeReactSigma.gotoNode).toHaveBeenCalledWith('notes/a', {
      duration: 0,
    })
    fakeReactSigma.gotoNode.mockClear()
    view.rerender(
      <GraphFocus graph={graph} id="notes/missing" depth={0} animate />,
    )
    view.rerender(<GraphFocus graph={graph} id={null} depth={1} animate />)
    expect(fakeReactSigma.gotoNode).not.toHaveBeenCalled()
    expect(fakeReactSigma.goto).not.toHaveBeenCalled()
  })
  it.each([true, false])(
    'restores the whole graph after local focus (animate=%s)',
    (animate) => {
      const graph = graphOf()
      const view = render(
        <GraphFocus graph={graph} id="notes/a" depth={1} animate={animate} />,
      )
      view.rerender(
        <GraphFocus graph={graph} id="notes/a" depth={0} animate={animate} />,
      )
      expect(fakeReactSigma.goto).toHaveBeenLastCalledWith(
        { x: 0.5, y: 0.5, ratio: 1, angle: 0 },
        { duration: animate ? 300 : 0 },
      )
      view.rerender(
        <GraphFocus graph={graph} id="notes/a" depth={1} animate={animate} />,
      )
      view.rerender(
        <GraphFocus graph={graph} id={null} depth={1} animate={animate} />,
      )
      expect(fakeReactSigma.goto).toHaveBeenLastCalledWith(
        { x: 0.5, y: 0.5, ratio: 1, angle: 0 },
        { duration: animate ? 300 : 0 },
      )
    },
  )
  it('leaves the camera alone when there are no visible nodes', () => {
    const graph = graphOf()
    graph.forEachNode((id) => {
      graph.setNodeAttribute(id, 'hidden', true)
    })
    render(<GraphFocus graph={graph} id="notes/a" depth={1} animate />)
    expect(fakeReactSigma.goto).not.toHaveBeenCalled()
  })
})
