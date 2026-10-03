import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { useHomeModel } from '../../hooks/useHomeModel'
import { ComponentList } from './ComponentList'
import { EventTicker } from './EventTicker'
import { OrbitMap } from './OrbitMap'
import { PendingStrip } from './PendingStrip'

export const HomeScreen = () => {
  const model = useHomeModel()
  return (
    <main className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orbit</h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {!model.synced && (
        <p className="text-muted">Waiting for the first readings…</p>
      )}
      {model.isPhone ? (
        <ComponentList cards={model.cards} now={model.now} />
      ) : (
        <OrbitMap cards={model.cards} animate={model.animate} now={model.now} />
      )}
      <PendingStrip rows={model.pending} now={model.now} />
      <EventTicker events={model.events} />
    </main>
  )
}
