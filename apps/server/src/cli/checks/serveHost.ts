// "name:443" as published by Tailscale Serve, without the port.
export const serveHost = (hostPort: string): string =>
  hostPort.replace(/:\d+$/, '')
