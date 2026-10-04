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

const neutral = { x: 0.5, y: 0.5, ratio: 1, angle: 0 }
const graphOf = () => new Graph<GraphNodeAttributes, GraphEdgeAttributes>()

beforeEach(() => {
  fakeReactSigma.goto.mockClear()
})

describe('GraphFocus', () => {
  it('frames the whole scene', () => {
    render(<GraphFocus graph={graphOf()} animate />)
    expect(fakeReactSigma.goto).toHaveBeenCalledWith(neutral, {
      duration: 300,
    })
  })
  it('reframes when the scene changes, without animating reduced motion', () => {
    const view = render(<GraphFocus graph={graphOf()} animate={false} />)
    view.rerender(<GraphFocus graph={graphOf()} animate={false} />)
    expect(fakeReactSigma.goto).toHaveBeenCalledTimes(2)
    expect(fakeReactSigma.goto).toHaveBeenLastCalledWith(neutral, {
      duration: 0,
    })
  })
})
