import { posix as pathPosix } from 'path'
import { Readable } from 'stream'

import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

import { driveApi, cacheControlHeader } from '../../../site.config'
import { FetchError, fetchJson, fetchResponse } from '../../utils/fetch'
import { encodePath, getAccessToken, checkAuthRoute } from '.'

// CORS middleware for raw links: https://nextjs.org/docs/api-routes/api-middlewares
export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const cors = Cors({ methods: ['GET', 'HEAD'] })
  return new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    res.status(403).json({ error: 'No access token.' })
    return
  }

  const { path = '/', odpt = '', proxy = false } = req.query

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    res.status(400).json({ error: 'Path query invalid.' })
    return
  }
  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

  // Handle protected routes authentication
  const odTokenHeader = (req.headers['od-protected-token'] as string) ?? odpt

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    res.status(code).json({ error: message })
    return
  }
  // If message is empty, then the path is not protected.
  // Conversely, protected routes are not allowed to serve from cache.
  if (message !== '') {
    res.setHeader('Cache-Control', 'no-cache')
  }

  await runCorsMiddleware(req, res)
  try {
    // Handle response from OneDrive API
    const requestUrl = `${driveApi}/root${encodePath(cleanPath)}`
    const data = await fetchJson<{ size?: number; '@microsoft.graph.downloadUrl'?: string }>(
      requestUrl,
      { headers: { Authorization: `Bearer ${accessToken}` } },
      {
        // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
        select: 'id,size,@microsoft.graph.downloadUrl',
      },
    )

    const downloadUrl = data['@microsoft.graph.downloadUrl']
    if (downloadUrl) {
      // Only proxy raw file content response for files up to 4MB
      if (proxy && typeof data.size === 'number' && data.size < 4194304) {
        const response = await fetchResponse(downloadUrl)
        const headers = Object.fromEntries(response.headers.entries())
        headers['Cache-Control'] = cacheControlHeader
        // Send data stream as response
        res.writeHead(200, headers)
        if (!response.body) {
          res.end()
          return
        }

        Readable.fromWeb(response.body as any).pipe(res)
      } else {
        res.redirect(downloadUrl)
      }
    } else {
      res.status(404).json({ error: 'No download url found.' })
    }
    return
  } catch (error) {
    if (error instanceof FetchError) {
      res.status(error.status).json({ error: error.data ?? 'Internal server error.' })
      return
    }

    res.status(500).json({ error: 'Internal server error.' })
    return
  }
}
