import type { Server } from 'node:http'

export type ListeningServer = { readonly server: Server; readonly port: number }
