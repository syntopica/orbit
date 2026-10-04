import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { RevealedSynthesisProps } from '../../types/RevealedSynthesisProps'

// Plain text only: synthesized output is never rendered as markup.
export const RevealedSynthesis = ({ content }: RevealedSynthesisProps) => (
  <div className="bg-space space-y-2 rounded p-3">
    <p className="font-semibold">{content.title}</p>
    <p className="whitespace-pre-wrap">{content.summary}</p>
    {content.facts.length > 0 ? (
      <>
        <h4 className="text-muted text-xs">{ATRIUM_LABELS.facts}</h4>
        <ul className="list-disc pl-5">
          {content.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </>
    ) : null}
    {content.openEnds.length > 0 ? (
      <>
        <h4 className="text-muted text-xs">{ATRIUM_LABELS.openEnds}</h4>
        <ul className="list-disc pl-5">
          {content.openEnds.map((end) => (
            <li key={end}>{end}</li>
          ))}
        </ul>
      </>
    ) : null}
  </div>
)
