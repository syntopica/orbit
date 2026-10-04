// An optional epoch-ms time in the viewer's locale; unknown is a dash.
export const formatTimeOrDash = (ms: number | null): string =>
  ms === null ? '—' : new Date(ms).toLocaleString()
