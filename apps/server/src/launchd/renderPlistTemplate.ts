import type { PlistValues } from '../types/PlistValues'
import { formatXmlText } from './formatters/formatXmlText'
import { ORBIT_LAUNCHD_LABEL } from './orbitLaunchdLabel'
import { validatePlistValue } from './validators/validatePlistValue'

// One pass over the template, so a substituted value is never re-scanned for
// placeholders.
export const renderPlistTemplate = (
  template: string,
  values: PlistValues,
): string => {
  const replacements: Readonly<Record<string, string>> = {
    __LABEL__: ORBIT_LAUNCHD_LABEL,
    __NODE__: formatXmlText(validatePlistValue(values.node)),
    __ORBIT__: formatXmlText(validatePlistValue(values.orbit)),
    __DATA__: formatXmlText(validatePlistValue(values.data)),
    __PATH__: formatXmlText(validatePlistValue(values.path)),
  }
  return template.replaceAll(
    /__(?:LABEL|NODE|ORBIT|DATA|PATH)__/gu,
    (token) => replacements[token] ?? token,
  )
}
