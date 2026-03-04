/**
 * Must match backend API_ERROR_CODES and error response shape.
 * See backend/docs/api-errors.md
 */
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ApiErrorCode = keyof typeof API_ERROR_CODES

export interface ValidationErrorDetail {
  path: string
  message: string
}

export interface ApiErrorResponseBody {
  error: {
    code: ApiErrorCode
    message: string
    details?: ValidationErrorDetail[]
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorResponseBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorResponseBody).error?.code === 'string' &&
    typeof (value as ApiErrorResponseBody).error?.message === 'string'
  )
}
