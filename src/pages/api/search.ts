import type { NextApiRequest, NextApiResponse } from 'next'

import { encodePath, getAccessToken } from '.'
import siteConfig from '../../../site.config'
import { FetchError, fetchJson } from '../../utils/fetch'

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string, which:
 * - encodes the '<' and '>' characters,
 * - replaces '?' and '/' characters with ' ',
 * - replaces ''' with ''''
 * Reference: https://stackoverflow.com/questions/41491222/single-quote-escaping-in-microsoft-graph.
 */
function sanitiseQuery(query: string): string {
  const sanitisedQuery = query
    .replace(/'/g, "''")
    .replace('<', ' &lt; ')
    .replace('>', ' &gt; ')
    .replace('?', ' ')
    .replace('/', ' ')
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Query parameter from request
  const { q: searchQuery = '' } = req.query

  // Set edge function caching for faster load times, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  res.setHeader('Cache-Control', siteConfig.cacheControlHeader)

  if (typeof searchQuery === 'string') {
    // Construct Microsoft Graph Search API URL, and perform search only under the base directory
    const searchRootPath = encodePath('/')
    const encodedPath = searchRootPath === '' ? searchRootPath : searchRootPath + ':'

    const searchApi = `${siteConfig.driveApi}/root${encodedPath}/search(q='${sanitiseQuery(searchQuery)}')`

    try {
      const data = await fetchJson<{ value: unknown[] }>(
        searchApi,
        { headers: { Authorization: `Bearer ${accessToken}` } },
        {
          select: 'id,name,file,folder,parentReference',
          top: siteConfig.maxItems,
        },
      )
      res.status(200).json(data.value)
    } catch (error) {
      if (error instanceof FetchError) {
        res.status(error.status).json({ error: error.data ?? 'Internal server error.' })
        return
      }

      res.status(500).json({ error: 'Internal server error.' })
    }
  } else {
    res.status(200).json([])
  }
  return
}
