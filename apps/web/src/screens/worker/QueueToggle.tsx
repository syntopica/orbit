import type { QueueToggleProps } from '../../types/QueueToggleProps'

// The queue name opens its activity detail.
export const QueueToggle = ({
  name,
  controls,
  open,
  onToggle,
}: QueueToggleProps) => (
  <button
    type="button"
    aria-expanded={open}
    aria-controls={open ? controls : undefined}
    onClick={onToggle}
    className="hover:text-accent flex items-center gap-1.5 text-left font-mono"
  >
    <span
      aria-hidden="true"
      data-open={open}
      className="text-muted text-[10px] transition-transform data-[open=true]:rotate-90"
    >
      ▶
    </span>
    {name}
  </button>
)
