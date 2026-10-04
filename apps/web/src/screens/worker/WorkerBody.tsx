import type { WorkerBodyProps } from '../../types/WorkerBodyProps'
import { ActivitySection } from './ActivitySection'
import { CooldownSection } from './CooldownSection'
import { CostsSection } from './CostsSection'
import { DiagnosisCard } from './DiagnosisCard'
import { ExecutorsSection } from './ExecutorsSection'
import { FailureSection } from './FailureSection'
import { NodeSection } from './NodeSection'
import { QueueSection } from './QueueSection'

// Queue state and failures first: they are what a visit is usually for.
export const WorkerBody = ({ body, isPhone, activity }: WorkerBodyProps) => (
  <>
    <DiagnosisCard diagnosis={body.diagnosis} />
    <QueueSection
      active={body.activeQueues}
      idle={body.idleQueues}
      isPhone={isPhone}
      activity={activity}
    />
    <FailureSection groups={body.failures} activity={activity} />
    <ActivitySection activity={activity} />
    <CooldownSection cooldowns={body.view.cooldowns} now={body.view.now} />
    <NodeSection nodes={body.view.nodes} />
    <CostsSection />
    <ExecutorsSection
      cooldowns={body.view.cooldowns}
      now={body.view.now}
      isPhone={isPhone}
    />
  </>
)
