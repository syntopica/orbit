import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useBrainSearch } from '../../hooks/useBrainSearch'
import { useBrainView } from '../../hooks/useBrainView'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { EngineActions } from '../actions/EngineActions'
import { BrainBody } from './BrainBody'

// Full width: the graph is the screen, so it takes every pixel the shell
// leaves; panels float over it or sit below it.
export const BrainScreen = () => {
  const brain = useBrainSearch()
  const view = useBrainView(brain.search)
  const isPhone = useMediaQuery('(max-width: 767px)')
  return (
    <main className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {BRAIN_LABELS.title}
        </h1>
        <div className="flex items-center gap-3">
          <EngineActions engine="brain" />
          {isPhone ? <ConnectionIndicator /> : null}
        </div>
      </header>
      {view.failed ? <p role="alert">{BRAIN_LABELS.unavailable}</p> : null}
      {view.data === null && !view.failed ? (
        <p className="text-muted">{BRAIN_LABELS.loading}</p>
      ) : null}
      <BrainBody view={view} brain={brain} />
    </main>
  )
}
