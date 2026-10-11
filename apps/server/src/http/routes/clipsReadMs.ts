// Request-triggered clips reads: two sequential engine runs, each up to the
// engine's own 20 s budget, plus room for a pool slot; the adapter's budget.
// At 10 s the read was killed whenever host load starved `clips status`.
export const CLIPS_READ_MS = 45_000
