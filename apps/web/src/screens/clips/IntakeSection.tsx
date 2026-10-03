import { ACTIVITY_CHART_HEIGHT } from '../../charts/activityChartHeight'
import { INTAKE_FILLS } from '../../charts/intakeFills'
import { describeIntakeColumn } from '../../formatters/describeIntakeColumn'
import { formatCount } from '../../formatters/formatCount'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import { TREND_LABELS } from '../../labels/trendLabels'
import { selectIntakeColumns } from '../../selectors/selectIntakeColumns'
import type { IntakeSectionProps } from '../../types/IntakeSectionProps'
import { StackedColumns } from '../worker/StackedColumns'

export const IntakeSection = ({ intake }: IntakeSectionProps) => {
  const columns = selectIntakeColumns(intake)
  return (
    <section
      aria-label={CLIPS_LABELS.intake}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.intake}</h2>
      <StackedColumns
        columns={columns}
        bucketMs={86_400_000}
        fills={INTAKE_FILLS}
        label={CLIPS_LABELS.intakeChart}
        height={ACTIVITY_CHART_HEIGHT}
        describe={describeIntakeColumn}
        renderTooltip={(c) => (
          <span className="whitespace-nowrap">{describeIntakeColumn(c)}</span>
        )}
      />
      <details className="text-sm">
        <summary className="text-muted cursor-pointer">
          {TREND_LABELS.showTable}
        </summary>
        <ul className="mt-2 text-xs tabular-nums">
          {columns.toReversed().map((c) => (
            <li key={c.start}>{describeIntakeColumn(c)}</li>
          ))}
        </ul>
      </details>
      <p className="text-muted text-xs">
        {formatCount(intake.undated)} {CLIPS_LABELS.undated}
      </p>
    </section>
  )
}
