import type { GuardConfig } from '../types/GuardConfig'

export const allowedOrigins = (config: GuardConfig): string[] => [
  `http://127.0.0.1:${String(config.port)}`,
  `http://localhost:${String(config.port)}`,
  ...config.allowedHosts.map((host) => `https://${host}`),
]
