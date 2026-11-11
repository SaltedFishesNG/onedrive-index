import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

export async function makePdfBook(file: File) {
  const assets = new URL('/api/pdf-assets/', window.location.href).href
  const pdf = await getDocument({
    data: await file.arrayBuffer(),
    cMapUrl: `${assets}cmaps/`,
    standardFontDataUrl: `${assets}standard_fonts/`,
    wasmUrl: `${assets}wasm/`,
    iccUrl: `${assets}iccs/`,
  }).promise
  const urls = new Set<string>()
  const outline = await pdf.getOutline()
  const makeToc = (items: NonNullable<typeof outline>) =>
    items.flatMap(item =>
      item.dest
        ? [{ label: item.title, href: JSON.stringify(item.dest), subitems: makeToc(item.items) }]
        : makeToc(item.items),
    )
  const resolveHref = async (href: string) => {
    const parsed = JSON.parse(href)
    const dest = typeof parsed === 'string' ? await pdf.getDestination(parsed) : parsed
    if (!dest) throw new Error('PDF destination not found')
    return { index: typeof dest[0] === 'number' ? dest[0] : await pdf.getPageIndex(dest[0]) }
  }
  const sections = Array.from({ length: pdf.numPages }, (_, index) => ({
    id: index,
    size: 1000,
    async load() {
      const page = await pdf.getPage(index + 1)
      const viewport = page.getViewport({ scale: 1 })
      const src = URL.createObjectURL(
        new Blob(
          [
            `<!doctype html>
            <html>
              <head>
                <meta name="viewport" content="width=${viewport.width}, height=${viewport.height}">
                <link rel="stylesheet" href="${window.location.origin}/pdf-text-layer.css">
              </head>
              <body>
                <div id="canvas"></div>
                <div class="textLayer"></div>
              </body>
            </html>`,
          ],
          { type: 'text/html' },
        ),
      )
      urls.add(src)
      let generation = 0
      let previousImageUrl: string | undefined
      return {
        src,
        onZoom: async ({ doc, scale }: { doc: Document; scale: number }) => {
          const current = ++generation
          const pixelRatio = window.devicePixelRatio || 1
          const scaled = page.getViewport({ scale: scale * pixelRatio })
          const canvas = document.createElement('canvas')
          canvas.width = scaled.width
          canvas.height = scaled.height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Canvas is unavailable')
          await page.render({ canvas, canvasContext: context, viewport: scaled }).promise
          if (current !== generation) return
          doc.documentElement.style.transform = `scale(${1 / pixelRatio})`
          doc.documentElement.style.transformOrigin = 'top left'
          doc.documentElement.style.setProperty('--scale-factor', String(scale * pixelRatio))
          doc.documentElement.style.setProperty('--total-scale-factor', String(scale * pixelRatio))
          const image = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve))
          if (!image || current !== generation) return
          const imageUrl = URL.createObjectURL(image)
          urls.add(imageUrl)
          const element = doc.createElement('img')
          element.src = imageUrl
          element.style.cssText = `display:block;width:${scaled.width}px;height:${scaled.height}px`
          doc.querySelector('#canvas')?.replaceChildren(element)
          if (previousImageUrl) {
            URL.revokeObjectURL(previousImageUrl)
            urls.delete(previousImageUrl)
          }
          previousImageUrl = imageUrl
          const layer = doc.querySelector<HTMLElement>('.textLayer')
          if (layer) {
            layer.replaceChildren()
            await new TextLayer({
              textContentSource: page.streamTextContent(),
              container: layer,
              viewport: scaled,
            }).render()
          }
        },
      }
    },
  }))
  return {
    sections,
    toc: outline ? makeToc(outline) : [],
    rendition: { layout: 'pre-paginated', spread: 'none' },
    resolveHref,
    splitTOCHref: async (href: string) => [(await resolveHref(href)).index, null],
    getTOCFragment: (doc: Document) => doc.documentElement,
    destroy: () => {
      for (const url of urls) URL.revokeObjectURL(url)
      void pdf.destroy()
    },
  }
}
