import useSWRInfinite from 'swr/infinite'

import type { OdAPIResponse } from '../types'

import { FetchError, fetchJson } from './fetch'
import { getStoredToken } from './protectedRouteHandler'

// Common fetch function for use with useSWR
export async function fetcher([url, token]: [url: string, token?: string]): Promise<any> {
  try {
    return await fetchJson(url, token ? { headers: { 'od-protected-token': token } } : undefined)
  } catch (error) {
    if (error instanceof FetchError) {
      throw { status: error.status, message: error.data }
    }
    throw error
  }
}

/**
 * Paging with useSWRInfinite + protected token support
 * @param path Current query directory path
 * @returns useSWRInfinite API
 */
export function useProtectedSWRInfinite(path: string = '') {
  const hashedToken = getStoredToken(path)

  /**
   * Next page infinite loading for useSWR
   * @param pageIdx The index of this paging collection
   * @param prevPageData Previous page information
   * @param path Directory path
   * @returns API to the next page
   */
  function getNextKey(pageIndex: number, previousPageData: OdAPIResponse): (string | null)[] | null {
    // Reached the end of the collection
    if (previousPageData && !previousPageData.folder) return null

    // First page with no prevPageData
    if (pageIndex === 0) return [`/api/?path=${path}`, hashedToken]

    // Add nextPage token to API endpoint
    return [`/api/?path=${path}&next=${previousPageData.next}`, hashedToken]
  }

  // Disable auto-revalidate, these options are equivalent to useSWRImmutable
  // https://swr.vercel.app/docs/revalidation#disable-automatic-revalidations
  const revalidationOptions = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  }
  return useSWRInfinite(getNextKey, fetcher, revalidationOptions)
}
