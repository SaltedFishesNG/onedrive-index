import { useEffect, useState } from 'react'

import { fetchText } from './fetch'
import { getStoredToken } from './protectedRouteHandler'

/**
 * Custom hook for fetch to retrieve raw file content on component mount
 * @param fetchUrl The URL pointing to the raw file content
 * @param path The path of the file, used for determining whether path is protected
 */
export default function useFileContent(
  fetchUrl: string,
  path: string,
): { response: any; error: string; validating: boolean } {
  const [response, setResponse] = useState('')
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const hashedToken = getStoredToken(path)
    const url = fetchUrl + (hashedToken ? `&odpt=${hashedToken}` : '')

    fetchText(url)
      .then(setResponse)
      .catch(e => setError(e.message))
      .finally(() => setValidating(false))
  }, [fetchUrl, path])
  return { response, error, validating }
}
