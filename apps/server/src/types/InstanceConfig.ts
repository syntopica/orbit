export type InstanceConfig = {
  readonly dataDir: string
  readonly engines: Readonly<Record<string, { readonly path: string }>>
}
