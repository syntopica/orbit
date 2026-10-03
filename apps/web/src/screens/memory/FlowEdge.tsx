import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react'

import { formatRate } from '../../formatters/formatRate'
import type { FlowEdgeType } from '../../types/FlowEdgeType'

// The rate is printed on the edge; the particle encodes it as motion (7.1).
export const FlowEdge = (props: EdgeProps<FlowEdgeType>) => {
  const [path, labelX, labelY] = getBezierPath(props)
  const perHour = props.data?.perHour ?? null
  const durationS = props.data?.durationS ?? null
  return (
    <>
      <BaseEdge id={props.id} path={path} className="stroke-line" />
      {perHour === null ? null : (
        <text
          x={labelX}
          y={labelY - 6}
          textAnchor="middle"
          className="fill-muted text-[10px]"
        >
          {`${formatRate(perHour)}/h`}
        </text>
      )}
      {durationS === null ? null : (
        <circle r={3} className="fill-accent">
          <animateMotion
            data-testid="flow-motion"
            dur={`${String(durationS)}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      )}
    </>
  )
}
