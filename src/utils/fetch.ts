export class FetchError extends Error {
  status: number
  data: any

  constructor(status: number, data: any, message?: string) {
    super(message ?? `Request failed with status ${status}`)
    this.name = 'FetchError'
    this.status = status
    this.data = data
  }
}

function buildUrl(input: string, params?: Record<string, string | number | boolean | undefined>) {
  if (!params) {
    return input
  }

  const url = new URL(input, input.startsWith('http') ? undefined : 'http://localhost')
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })

  return input.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`
}

async function parseResponseBody(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

async function handleResponse(response: Response) {
  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new FetchError(response.status, data, response.statusText)
  }

  return data
}

export async function fetchJson<T>(
  input: string,
  init?: RequestInit,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(input, params), init)
  return handleResponse(response) as Promise<T>
}

export async function fetchText(input: string, init?: RequestInit) {
  const response = await fetch(input, init)

  if (!response.ok) {
    throw new FetchError(response.status, await parseResponseBody(response), response.statusText)
  }

  return response.text()
}

export async function fetchResponse(
  input: string,
  init?: RequestInit,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const response = await fetch(buildUrl(input, params), init)

  if (!response.ok) {
    throw new FetchError(response.status, await parseResponseBody(response), response.statusText)
  }

  return response
}
