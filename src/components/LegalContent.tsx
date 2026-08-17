import { Fragment, ReactNode } from "react"

const linkify = (text: string): ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.]+)/g)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="text-foreground font-medium">
          {part.slice(2, -2)}
        </span>
      )
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4AF37] hover:underline break-all"
        >
          {part}
        </a>
      )
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="text-[#D4AF37] hover:underline">
          {part}
        </a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function LegalContent({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n")
  const blocks: ReactNode[] = []
  let listBuffer: string[] = []

  const flushList = (key: string) => {
    if (!listBuffer.length) return
    blocks.push(
      <ul key={key} className="space-y-2 pl-5">
        {listBuffer.map((item, i) => (
          <li key={i} className="list-disc marker:text-[#D4AF37]">
            {linkify(item)}
          </li>
        ))}
      </ul>
    )
    listBuffer = []
  }

  lines.forEach((raw, index) => {
    const line = raw.trim()

    if (!line) {
      flushList(`list-${index}`)
      return
    }

    if (line.startsWith("## ")) {
      flushList(`list-${index}`)
      blocks.push(
        <h2 key={index} className="text-xl font-medium text-foreground pt-4">
          {line.slice(3)}
        </h2>
      )
      return
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      listBuffer.push(line.slice(2))
      return
    }

    flushList(`list-${index}`)
    blocks.push(<p key={index}>{linkify(line)}</p>)
  })

  flushList("list-final")

  return <div className="space-y-4">{blocks}</div>
}
