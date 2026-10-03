import type { AtriumBodyProps } from '../../types/AtriumBodyProps'
import { FreshnessCard } from './FreshnessCard'
import { PopulationTable } from './PopulationTable'
import { SourceBars } from './SourceBars'
import { SynthesisSection } from './SynthesisSection'

export const AtriumBody = ({ view, model }: AtriumBodyProps) => (
  <>
    <div className="grid gap-4 md:grid-cols-2">
      <FreshnessCard view={view} />
      <SourceBars records={view.records} />
    </div>
    <SynthesisSection view={view} model={model} />
    <PopulationTable populations={view.populations} />
  </>
)
