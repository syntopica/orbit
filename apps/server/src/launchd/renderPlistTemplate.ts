import type { PlistValues } from '../types/PlistValues'
import { formatXmlText } from './formatters/formatXmlText'
import { validatePlistValue } from './validators/validatePlistValue'

// One pass over the template, so a substituted value is never re-scanned for
// placeholders.
export const renderPlistTemplate = (
  template: string,
  values: PlistValues,
): string => {
  const replacements: Readonly<Record<string, string>> = {
    __NODE__: formatXmlText(validatePlistValue(values.node)),
    __ORBIT__: formatXmlText(validatePlistValue(values.orbit)),
    __DATA__: formatXmlText(validatePlistValue(values.data)),
  }
  return template.replaceAll(
    /__(?:NODE|ORBIT|DATA)__/gu,
    (token) => replacements[token] ?? token,
  )
}
