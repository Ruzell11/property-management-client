import type { ApiErrorResponseBody } from './errorCodes'
import { API_ERROR_CODES, isApiErrorBody } from './errorCodes'

const BASE = '' // Vite proxy forwards /api to backend

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: ApiErrorResponseBody }

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = res.status === 204 ? null : (await res.json().catch(() => ({})) as unknown)

  if (!res.ok) {
    if (body !== null && isApiErrorBody(body)) {
      return { data: null, error: body }
    }
    return {
      data: null,
      error: {
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: (body && typeof body === 'object' && 'message' in body)
            ? String((body as { message: unknown }).message)
            : 'Request failed',
        },
      },
    }
  }

  return { data: (body ?? undefined) as T, error: null }
}

