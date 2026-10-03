export type SparklineProps = {
  readonly starts: readonly number[]
  readonly values: readonly number[]
  readonly bucketMs: number
  readonly label: string
  readonly unit: string
  readonly stroke: string
  readonly dot: string
}
