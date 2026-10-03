import '@react-sigma/core/lib/style.css'

import { SigmaContainer } from '@react-sigma/core'

import { useGraphSettings } from '../../hooks/useGraphSettings'
import type { GraphCanvasProps } from '../../types/GraphCanvasProps'
import { GraphEvents } from './GraphEvents'
import { GraphFocus } from './GraphFocus'
import { GraphLoader } from './GraphLoader'

// The only component that touches sigma; tests mock it at this boundary.
export const GraphCanvas = ({
  graph,
  palette,
  selectedId,
  onSelect,
  animate,
  depth,
}: GraphCanvasProps) => {
  const settings = useGraphSettings(palette)
  return (
    <SigmaContainer
      settings={settings}
      className="pointer-events-auto size-full"
    >
      <GraphLoader graph={graph} />
      <GraphEvents onSelect={onSelect} />
      <GraphFocus
        id={selectedId}
        animate={animate}
        depth={depth}
        graph={graph}
      />
    </SigmaContainer>
  )
}
