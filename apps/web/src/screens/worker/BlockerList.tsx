import type { BlockerListProps } from '../../types/BlockerListProps'
import { BlockerLine } from './BlockerLine'

export const BlockerList = ({ blockers }: BlockerListProps) => (
  <ul className="list-disc space-y-1 pl-5">
    {blockers.map((blocker) => (
      <BlockerLine
        key={`${blocker.kind}:${blocker.subject ?? ''}`}
        blocker={blocker}
      />
    ))}
  </ul>
)
