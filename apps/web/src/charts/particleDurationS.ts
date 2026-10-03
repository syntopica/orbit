// One particle crosses every 60 / perHour s, so the rate is proportional to
// throughput within 1.5-12 s (D6); no rate, no particle.
export const particleDurationS = (perHour: number | null): number | null =>
  perHour === null || perHour <= 0
    ? null
    : Math.min(12, Math.max(1.5, 60 / perHour))
