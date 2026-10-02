import type { WorkerBodyProps } from '../../types/WorkerBodyProps'
import { CooldownSection } from './CooldownSection'
import { DiagnosisCard } from './DiagnosisCard'
import { FailureSection } from './FailureSection'
import { NodeSection } from './NodeSection'
import { QueueSection } from './QueueSection'

export const WorkerBody = ({ body, isPhone }: WorkerBodyProps) => (
  <>
    <DiagnosisCard diagnosis={body.diagnosis} />
    <QueueSection
      active={body.activeQueues}
      idle={body.idleQueues}
      isPhone={isPhone}
    />
    <CooldownSection cooldowns={body.view.cooldowns} now={body.view.now} />
    <NodeSection nodes={body.view.nodes} />
    <FailureSection groups={body.failures} />
  </>
)
