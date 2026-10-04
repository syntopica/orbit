import '@react-sigma/core/lib/style.css'

import { SigmaContainer } from '@react-sigma/core'

import { useGraphSettings } from '../../hooks/useGraphSettings'
import { useHoveredNode } from '../../hooks/useHoveredNode'
import type { GraphCanvasProps } from '../../types/GraphCanvasProps'
import { GraphEvents } from './GraphEvents'
import { GraphFocus } from './GraphFocus'
import { GraphHighlight } from './GraphHighlight'
import { GraphLoader } from './GraphLoader'

// The only component that touches sigma; tests mock it at this boundary.
export const GraphCanvas = ({
  graph,
  palette,
  onSelect,
  animate,
}: GraphCanvasProps) => {
  const settings = useGraphSettings(palette)
  const [hovered, setHovered] = useHoveredNode()
  return (
    <SigmaContainer
      settings={settings}
      className="pointer-events-auto size-full"
    >
      <GraphLoader graph={graph} />
      <GraphEvents onSelect={onSelect} onHover={setHovered} />
      <GraphHighlight graph={graph} centre={hovered} palette={palette} />
      <GraphFocus animate={animate} graph={graph} />
    </SigmaContainer>
  )
}
