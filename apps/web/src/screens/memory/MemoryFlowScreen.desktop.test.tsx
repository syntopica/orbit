import { FLOW_STAGE_IDS, type MemoryFlow } from '@orbit/contract'
import { fireEvent, screen, within } from '@testing-library/react'
import type { ComponentType } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderAt } from '../../test/renderAt'

type FakeNode = { id: string; type: string; data: unknown }
type FakeFlowProps = {
  nodes: readonly FakeNode[]
  nodeTypes: Readonly<Record<string, ComponentType<FakeNode>>>
}

// jsdom cannot lay out React Flow; the fake renders each node's component.
vi.mock('@xyflow/react', async () => {
  const { createElement } = await import('react')
  return {
    ReactFlow: ({ nodes, nodeTypes }: FakeFlowProps) =>
      createElement(
        'div',
        null,
        nodes.map((node) => {
          const NodeView = nodeTypes[node.type]
          return NodeView === undefined
            ? null
            : createElement(NodeView, { key: node.id, ...node })
        }),
      ),
    Handle: () => null,
    Position: { Left: 'left', Right: 'right' },
    BaseEdge: () => null,
    getBezierPath: () => ['M0,0 L10,10', 5, 5],
  }
})

const flow: MemoryFlow = {
  now: 1_790_000_000_000,
  stages: FLOW_STAGE_IDS.map((id) => ({
    id,
    component: 'atrium',
    state: 'unknown',
    freshAt: null,
    policyMs: null,
    label: null,
    lastRunAt: null,
    backlog: null,
    metrics: [],
    pending: [],
  })),
  edges: [],
}

describe('MemoryFlowScreen on a desktop', () => {
  it('draws the stages on the canvas and opens a panel from a node', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(Response.json(flow))),
    )
    await renderAt('/memory')
    const canvas = await screen.findByRole('group', {
      name: 'Memory flow diagram',
    })
    expect(within(canvas).getAllByRole('button')).toHaveLength(8)
    fireEvent.click(
      within(canvas).getByRole('button', { name: 'Curation: Not measured' }),
    )
    expect(
      await screen.findByRole('complementary', { name: 'Curation' }),
    ).toBeInTheDocument()
  })
})
