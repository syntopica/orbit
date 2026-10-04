import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { DoctorListProps } from '../../types/DoctorListProps'

// Check names, severities and codes are identifiers, shown verbatim.
export const DoctorList = ({ doctor, note }: DoctorListProps) => {
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
              {check.severity === undefined ? null : (
                <span> [{check.severity}]</span>
              )}
              {check.code === null ? null : (
                <span className="text-muted"> {check.code}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {note === undefined ? null : <p className="text-muted text-xs">{note}</p>}
    </section>
  )
}
