import { useSynthesisContent } from '../../hooks/useSynthesisContent'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import type { SynthesisRevealProps } from '../../types/SynthesisRevealProps'
import { RevealedSynthesis } from './RevealedSynthesis'

// The output's text, fetched only when asked for and dropped on hide.
export const SynthesisReveal = ({ jobKey }: SynthesisRevealProps) => {
  const content = useSynthesisContent(jobKey)
  const { query } = content
  return (
    <>
      <button
        type="button"
        className="text-accent cursor-pointer underline"
        onClick={content.revealed ? content.conceal : content.reveal}
      >
        {content.revealed ? ATRIUM_LABELS.conceal : ATRIUM_LABELS.reveal}
      </button>
      {content.revealed && query.isPending ? (
        <p>{ATRIUM_LABELS.revealing}</p>
      ) : null}
      {content.revealed && query.isError ? (
        <p role="alert">{ATRIUM_LABELS.revealFailed}</p>
      ) : null}
      {content.revealed && query.data !== undefined ? (
        <RevealedSynthesis content={query.data} />
      ) : null}
    </>
  )
}
