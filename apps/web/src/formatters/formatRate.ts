// One decimal under 10 per hour, whole numbers above.
export const formatRate = (perHour: number): string =>
  perHour < 10 ? perHour.toFixed(1) : String(Math.round(perHour))
