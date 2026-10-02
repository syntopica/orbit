import { z } from 'zod'

// zod probes `new Function` to pick a fast path; under the CSP (no
// 'unsafe-eval') that probe is reported as a violation on every load.
z.config({ jitless: true })
