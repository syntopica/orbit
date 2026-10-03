import { layoutResultSchema } from '../schemas/layoutResultSchema'
import type { LayoutRequest } from '../types/LayoutRequest'
import type { LayoutResult } from '../types/LayoutResult'

// One request per worker: the answer is validated against the request's
// order, and the worker is terminated whatever happens.
export const requestLayout = async (
  createWorker: () => Worker,
  request: LayoutRequest,
): Promise<LayoutResult> =>
  new Promise((resolve, reject) => {
    const worker = createWorker()
    worker.addEventListener('message', (event: MessageEvent<unknown>) => {
      worker.terminate()
      const parsed = layoutResultSchema.safeParse(event.data)
      const fits =
        parsed.success &&
        [parsed.data.x, parsed.data.y, parsed.data.community].every(
          (values) => values.length === request.order,
        )
      if (fits) resolve(parsed.data)
      else reject(new Error('layout_invalid'))
    })
    worker.addEventListener('error', () => {
      worker.terminate()
      reject(new Error('layout_failed'))
    })
    worker.postMessage(request)
  })
