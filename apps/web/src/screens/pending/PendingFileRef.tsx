import type { PendingFileRefProps } from '../../types/PendingFileRefProps'

export const PendingFileRef = ({ reference }: PendingFileRefProps) => {
  const label = `${reference.file}:${String(reference.line)}`
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-mono break-all">{label}</span>
      <button
        type="button"
        className="text-accent underline"
        onClick={() => {
          void navigator.clipboard.writeText(label)
        }}
      >
        Copy reference
      </button>
    </div>
  )
}
