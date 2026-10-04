export type JobContentPaneProps = {
  readonly title: 'Input' | 'Output'
  readonly text: string | null
  readonly onCopy: (text: string) => void
}
