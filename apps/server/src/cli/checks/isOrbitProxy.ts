// Whether a Serve proxy target is orbit's own loopback port.
export const isOrbitProxy = (
  proxy: string | undefined,
  port: number,
): boolean =>
  ['127.0.0.1', 'localhost'].some((host) => {
    const target = `http://${host}:${String(port)}`
    return proxy === target || proxy === `${target}/`
  })
