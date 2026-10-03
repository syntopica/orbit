// Nodes run only while their machine is idle and queues may wait for a quiet
// window, so a missing node or a queued job is normal. A job left queued for a
// whole day is not: nothing has picked work up in that time.
export const WORKER_LAG_LIMIT_S = 24 * 60 * 60
