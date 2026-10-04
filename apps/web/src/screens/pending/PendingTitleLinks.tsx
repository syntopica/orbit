import { splitUrls } from '../../selectors/splitUrls'

// The title sits in the row's <summary>, where a link would nest inside the
// toggle; its addresses are linked here, in the opened row, instead.
export const PendingTitleLinks = ({ title }: { title: string }) => {
  const urls = splitUrls(title).filter((segment) => segment.url)
  if (urls.length === 0) return null
  return (
    <ul className="space-y-1 text-sm">
      {urls.map((segment) => (
        <li key={segment.at} className="wrap-anywhere">
          <a
            href={segment.text}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            {segment.text}
          </a>
        </li>
      ))}
    </ul>
  )
}
