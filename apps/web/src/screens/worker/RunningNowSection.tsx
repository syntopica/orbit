import { useRunningJobs } from '../../hooks/useRunningJobs'
import { RunningJobRow } from './RunningJobRow'

export const RunningNowSection = () => {
  const running = useRunningJobs()
  return (
    <section aria-labelledby="running-heading" className="space-y-3">
      <h2
        id="running-heading"
        className="text-muted text-sm font-semibold uppercase"
      >
        Running now
      </h2>
      {running.failed ? (
        <p className="text-muted text-sm">Could not read running jobs.</p>
      ) : null}
      {running.jobs === null && !running.failed ? (
        <p className="text-muted text-sm">Reading running jobs…</p>
      ) : null}
      {running.jobs?.length === 0 ? (
        <p className="text-muted text-sm">Nothing is running.</p>
      ) : null}
      {running.jobs !== null && running.jobs.length > 0 ? (
        <ul className="divide-line border-line bg-panel divide-y rounded-xl border">
          {running.jobs.map((job) => (
            <RunningJobRow key={job.id} job={job} now={running.now} />
          ))}
        </ul>
      ) : null}
    </section>
  )
}
