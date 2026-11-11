import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { NextApiRequest, NextApiResponse } from 'next'

const groups = ['cmaps', 'standard_fonts', 'wasm', 'iccs']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { group, file } = req.query
  if (
    req.method !== 'GET' ||
    typeof group !== 'string' ||
    !groups.includes(group) ||
    typeof file !== 'string' ||
    !/^[a-zA-Z0-9_-]+\.(bcmap|pfb|ttf|wasm|js|icc)$/.test(file)
  ) {
    return res.status(404).end()
  }

  try {
    const data = await readFile(path.join(process.cwd(), 'node_modules/pdfjs-dist', group, file))
    const contentType = file.endsWith('.wasm')
      ? 'application/wasm'
      : file.endsWith('.js')
        ? 'text/javascript'
        : 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    return res.status(200).send(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return res.status(404).end()
    throw error
  }
}
