import { formatLastPass } from '../../formatters/formatLastPass'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SynthesisSectionProps } from '../../types/SynthesisSectionProps'
import { TrendSection } from '../memory/TrendSection'

// The last pass from synthesis.json; the trend is orbit's own samples of it
// (a per-pass ledger needs atrium support, spec 7 item 4).
export const SynthesisSection = ({ view, model }: SynthesisSectionProps) => (
  <section aria-label={ATRIUM_LABELS.synthesis} className="space-y-3">
    <h2 className="text-lg font-semibold">{ATRIUM_LABELS.synthesis}</h2>
    <p className="text-sm">
      {view.synthesis === null
        ? ATRIUM_LABELS.noPass
        : formatLastPass(view.synthesis, view.now)}
    </p>
    <TrendSection
      title={ATRIUM_LABELS.trend}
      chartLabel={ATRIUM_LABELS.trendChart}
      trend={model.trend}
      range={model.range}
      setRange={model.setRange}
    />
  </section>
)
