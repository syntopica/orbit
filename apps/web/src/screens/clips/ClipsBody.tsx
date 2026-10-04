import { formatCheckedAt } from '../../formatters/formatCheckedAt'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import { selectFunnel } from '../../selectors/selectFunnel'
import type { ClipsBodyProps } from '../../types/ClipsBodyProps'
import { TrendSection } from '../memory/TrendSection'
import { ClipsFunnel } from './ClipsFunnel'
import { ClipsItemsSection } from './ClipsItemsSection'
import { DoctorList } from './DoctorList'
import { IntakeSection } from './IntakeSection'
import { OldestList } from './OldestList'

export const ClipsBody = ({ view, model }: ClipsBodyProps) => {
  const rows = selectFunnel(view)
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <ClipsFunnel rows={rows} capture={view.capture} now={view.now} />
        <OldestList states={view.states} now={view.now} />
      </div>
      <ClipsItemsSection items={view.items} now={view.now} />
      <IntakeSection intake={view.intake} />
      <TrendSection
        title={CLIPS_LABELS.backlog}
        chartLabel={CLIPS_LABELS.backlogChart}
        trend={model.trend}
        range={model.range}
        setRange={model.setRange}
      />
      <DoctorList doctor={view.doctor} note={formatCheckedAt(view.now)} />
    </>
  )
}
