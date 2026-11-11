import { FC, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import 'foliate-js/view.js'

import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer } from './Containers'
import { getStoredToken } from '../../utils/protectedRouteHandler'
import type { OdFileObject } from '../../types'

type TocItem = { label: string; href: string; subitems?: TocItem[] }
type ReaderView = HTMLElement & {
  book: { toc?: TocItem[]; rendition?: { layout?: string }; destroy?: () => void }
  renderer: HTMLElement
  open: (book: File | object) => Promise<void>
  init: (options: object) => Promise<void>
  goTo: (href: string) => Promise<void>
  goLeft: () => Promise<void>
  goRight: () => Promise<void>
  close: () => void
}

const BookPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)
  const container = useRef<HTMLDivElement>(null)
  const view = useRef<ReaderView | null>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    let reader: ReaderView | null = null
    const frame = document.createElement('iframe')
    frame.title = 'Document reader'
    frame.setAttribute('sandbox', 'allow-same-origin')
    frame.style.cssText = 'display: block; width: 100%; height: 70vh; border: 0;'
    frame.srcdoc = `
      <!doctype html>
      <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'none'; script-src 'none'; style-src 'self' 'unsafe-inline' blob:;
            img-src blob: data:; font-src blob: data:; media-src blob: data:; frame-src blob:;"
          >
          <style>
            html, body { margin: 0; height: 100%; }
            foliate-view { display: block; width: 100%; height: 100%; }
          </style>
        </head>
        <body></body>
      </html>
    `
    frame.onload = async () => {
      setStatus('loading')
      setToc([])
      try {
        if (cancelled || !frame.contentDocument) return
        reader = document.createElement('foliate-view') as ReaderView
        frame.contentDocument.body.append(reader)
        const response = await fetch(`/api/raw?path=${asPath}${hashedToken ? '&odpt=' + hashedToken : ''}`)
        if (!response.ok) throw new Error(`Failed to fetch document: ${response.status}`)
        const data = new File([await response.blob()], file.name.toLowerCase())
        if (cancelled) return
        // PDFs need a separate adapter; avoid loading PDF.js for other formats.
        const book = file.name.toLowerCase().endsWith('.pdf')
          ? await import('./pdfBook').then(m => m.makePdfBook(data))
          : data
        if (cancelled) {
          if (!(book instanceof File)) book.destroy()
          return
        }
        await reader.open(book)
        if (cancelled) {
          reader.close()
          reader.book?.destroy?.()
          return
        }
        if (reader.book.rendition?.layout === 'pre-paginated') {
          // Constructed stylesheets do not survive adoption into the sandbox document.
          reader.renderer.style.cssText = `
            width: 100%; height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
          `
        }
        reader.renderer.setAttribute('flow', 'scrolled')
        await reader.init({})
        if (cancelled) {
          reader.book?.destroy?.()
          return
        }
        view.current = reader
        setToc(reader.book.toc ?? [])
        setStatus('ready')
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to open document:', error)
          setStatus('error')
        }
      }
    }
    container.current?.append(frame)
    return () => {
      cancelled = true
      frame.onload = null
      view.current = null
      reader?.close()
      reader?.book?.destroy?.()
      frame.remove()
    }
  }, [asPath, hashedToken, file.name])

  const renderToc = (items: TocItem[]) => (
    <ul className="pl-4">
      {items.map(item => (
        <li key={item.href}>
          <button className="text-left hover:underline" onClick={() => void view.current?.goTo(item.href)}>
            {item.label}
          </button>
          {item.subitems && renderToc(item.subitems)}
        </li>
      ))}
    </ul>
  )

  return (
    <div>
      <div className="rounded-sm bg-white md:p-3 dark:bg-gray-900">
        {status === 'loading' && <Loading loadingText="Loading document ..." />}
        {status === 'error' && <p role="alert">Unable to open document.</p>}
        {status === 'ready' && (
          <div className="flex items-start gap-4 p-2">
            <button onClick={() => void view.current?.goLeft()}>Previous</button>
            <button onClick={() => void view.current?.goRight()}>Next</button>
            {toc.length > 0 && (
              <details>
                <summary>Contents</summary>
                {renderToc(toc)}
              </details>
            )}
          </div>
        )}
        <div ref={container} />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </div>
  )
}

export default BookPreview
