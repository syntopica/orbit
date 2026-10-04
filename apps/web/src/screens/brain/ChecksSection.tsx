import { BRAIN_TREND_SPECS } from '../../charts/brainTrendSpecs'
import { formatCheckedAt } from '../../formatters/formatCheckedAt'
import { useBrainChecks } from '../../hooks/useBrainChecks'
import { useTrend } from '../../hooks/useTrend'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { ChecksSectionProps } from '../../types/ChecksSectionProps'
import { DoctorList } from '../clips/DoctorList'
import { TrendSection } from '../memory/TrendSection'
import { LintPanel } from './LintPanel'

// Doctor reuses the Clips panel as is: same shape, generic labels (D13).
export const ChecksSection = ({ brain }: ChecksSectionProps) => {
  const { checks, failed, checkedAt } = useBrainChecks()
  const trend = useTrend('brain', brain.search.range, BRAIN_TREND_SPECS, {
    poll: false,
    gcTime: 0,
  })
  return (
    <>
      {failed ? (
        <p role="alert" className="text-sm">
          {BRAIN_LABELS.checksUnavailable}
        </p>
      ) : null}
      {checks === null ? null : (
        <>
          <LintPanel
            checks={checks}
            search={brain.search}
            checkedAt={checkedAt}
          />
          <DoctorList
            doctor={checks.doctor}
            note={checkedAt === null ? undefined : formatCheckedAt(checkedAt)}
          />
        </>
      )}
      <TrendSection
        title={BRAIN_LABELS.trend}
        chartLabel={BRAIN_LABELS.trendChart}
        trend={trend}
        range={brain.search.range}
        setRange={(range) => {
          brain.update({ range })
        }}
      />
    </>
  )
}
