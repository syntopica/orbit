import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useBrainSearch } from '../../hooks/useBrainSearch'
import { useBrainView } from '../../hooks/useBrainView'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import { BrainBody } from './BrainBody'

export const BrainScreen = () => {
  const brain = useBrainSearch()
  const view = useBrainView(brain.search)
  const isPhone = useMediaQuery('(max-width: 767px)')
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {BRAIN_LABELS.title}
        </h1>
        {isPhone ? <ConnectionIndicator /> : null}
      </header>
      {view.failed ? <p role="alert">{BRAIN_LABELS.unavailable}</p> : null}
      {view.data === null && !view.failed ? (
        <p className="text-muted">{BRAIN_LABELS.loading}</p>
      ) : null}
      <BrainBody view={view} brain={brain} />
    </main>
  )
}
