import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { GraphControlsProps } from '../../types/GraphControlsProps'
import { DepthControl } from './DepthControl'
import { GraphFilters } from './GraphFilters'
import { PageSearch } from './PageSearch'
import { SceneToggle } from './SceneToggle'

// Floats over the canvas from lg up. Finding a page, the view and the
// drawing stay in reach; colour and filters fold away so the graph shows.
export const GraphControls = ({ model, brain }: GraphControlsProps) => (
  <section
    aria-label={BRAIN_LABELS.controls}
    className="border-line bg-panel lg:bg-panel/90 grid gap-3 rounded-xl border p-3 text-sm md:grid-cols-2 lg:max-h-[calc(100dvh-12rem)] lg:grid-cols-1 lg:overflow-y-auto lg:shadow-lg lg:backdrop-blur"
  >
    <PageSearch model={model} select={brain.select} />
    <DepthControl brain={brain} />
    <SceneToggle brain={brain} />
    <GraphFilters model={model} brain={brain} />
  </section>
)
