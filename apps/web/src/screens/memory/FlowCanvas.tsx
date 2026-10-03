import '@xyflow/react/dist/base.css'

import { ReactFlow } from '@xyflow/react'

import { FLOW_LABELS } from '../../labels/flowLabels'
import { selectFlowGraph } from '../../selectors/selectFlowGraph'
import type { FlowCanvasProps } from '../../types/FlowCanvasProps'
import { FLOW_EDGE_TYPES } from './flowEdgeTypes'
import { FLOW_NODE_TYPES } from './flowNodeTypes'

// A fixed diagram: no drag, pan, zoom or connect; nodes hold real buttons.
export const FlowCanvas = (props: FlowCanvasProps) => {
  const { flow, selectedId, onSelect, animate } = props
  const graph = selectFlowGraph(flow, selectedId, onSelect, animate)
  return (
    <div
      role="group"
      aria-label={FLOW_LABELS.canvas}
      className="border-line bg-panel h-128 w-full overflow-hidden rounded-xl border"
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={FLOW_NODE_TYPES}
        edgeTypes={FLOW_EDGE_TYPES}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        panActivationKeyCode={null}
        zoomActivationKeyCode={null}
        autoPanOnNodeFocus={false}
        disableKeyboardA11y
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  )
}
