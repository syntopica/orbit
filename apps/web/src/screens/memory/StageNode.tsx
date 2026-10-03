import { Handle, type NodeProps, Position } from '@xyflow/react'

import type { StageNodeType } from '../../types/StageNodeType'
import { StageButton } from './StageButton'

// Handles exist only to anchor edges; nothing can be connected.
export const StageNode = ({ data }: NodeProps<StageNodeType>) => (
  <div className="pointer-events-auto w-52">
    <Handle
      type="target"
      position={Position.Left}
      isConnectable={false}
      className="opacity-0"
    />
    <StageButton
      stage={data.stage}
      selected={data.selected}
      onSelect={data.onSelect}
    />
    <Handle
      type="source"
      position={Position.Right}
      isConnectable={false}
      className="opacity-0"
    />
  </div>
)
