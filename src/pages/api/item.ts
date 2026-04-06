import type { NextApiRequest, NextApiResponse } from 'next'

import { getAccessToken } from '.'
import siteConfig from '../../../site.config'
import { FetchError, fetchJson } from '../../utils/fetch'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get access token from storage
  const accessToken = await getAccessToken()

  // Get item details (specifically, its path) by its unique ID in OneDrive
  const { id = '' } = req.query

  // Set edge function caching for faster load times, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  res.setHeader('Cache-Control', siteConfig.cacheControlHeader)

  if (typeof id === 'string') {
    const itemApi = `${siteConfig.driveApi}/items/${id}`

    try {
      const data = await fetchJson(
        itemApi,
        { headers: { Authorization: `Bearer ${accessToken}` } },
        { select: 'id,name,parentReference' },
      )
      res.status(200).json(data)
    } catch (error) {
      if (error instanceof FetchError) {
        res.status(error.status).json({ error: error.data ?? 'Internal server error.' })
        return
      }

      res.status(500).json({ error: 'Internal server error.' })
    }
  } else {
    res.status(400).json({ error: 'Invalid driveItem ID.' })
  }
  return
}
