import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { DoctorListProps } from '../../types/DoctorListProps'

// Check names and codes are identifiers from clips, shown verbatim.
export const DoctorList = ({ doctor }: DoctorListProps) => {
  const failing = doctor.checks.filter((check) => !check.ok)
  return (
    <section
      aria-label={CLIPS_LABELS.doctor}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CLIPS_LABELS.doctor}</h2>
      {failing.length === 0 ? (
        <p className="text-muted text-sm">
          {doctor.ok ? CLIPS_LABELS.allPass : CLIPS_LABELS.doctorFailure}
        </p>
      ) : (
        <ul className="space-y-1 font-mono text-sm">
          {failing.map((check) => (
            <li key={check.name} className="wrap-anywhere">
              {check.name}
              {check.code === null ? null : (
                <span className="text-muted"> {check.code}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
