import type { Server } from 'node:http'

export type OrbitListenResult = {
  readonly servers: Server[]
  readonly port: number
}
