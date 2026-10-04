// Request-triggered brain reads: the engine's own 20 s read budget plus room
// for a pool slot. At 10 s the graph failed whenever host load passed ~100.
export const BRAIN_READ_MS = 25_000
