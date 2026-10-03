import type { WorkerBodyProps } from '../../types/WorkerBodyProps'
import { ActivitySection } from './ActivitySection'
import { CooldownSection } from './CooldownSection'
import { DiagnosisCard } from './DiagnosisCard'
import { FailureSection } from './FailureSection'
import { NodeSection } from './NodeSection'
import { QueueSection } from './QueueSection'

export const WorkerBody = ({ body, isPhone, activity }: WorkerBodyProps) => (
  <>
    <DiagnosisCard diagnosis={body.diagnosis} />
    <ActivitySection activity={activity} />
    <QueueSection
      active={body.activeQueues}
      idle={body.idleQueues}
      isPhone={isPhone}
      activity={activity}
    />
    <CooldownSection cooldowns={body.view.cooldowns} now={body.view.now} />
    <NodeSection nodes={body.view.nodes} />
    <FailureSection groups={body.failures} activity={activity} />
  </>
)
