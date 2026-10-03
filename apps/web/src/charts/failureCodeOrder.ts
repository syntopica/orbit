// Fixed code-to-slot table: a code keeps its colour in every range. Codes
// not listed fold into the neutral "other".
export const FAILURE_CODE_ORDER: readonly string[] = [
  'no_output',
  'schema_violation',
  'quota_wall',
  'lease_lost',
  'timeout',
  'executor_error',
]
