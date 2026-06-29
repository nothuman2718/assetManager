const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'

type ApiOptions = RequestInit & {
  token?: string | null
}

export const apiRequest = async <T>(path: string, options: ApiOptions = {}) => {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.message ?? 'Request failed')
  }

  return body.data as T
}
