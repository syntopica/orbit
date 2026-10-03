// At most 24 px, never filling the band: some air, and at least a 2 px gap.
export const barWidth = (step: number): number =>
  Math.max(1, Math.min(24, step * 0.72, step - 2))
