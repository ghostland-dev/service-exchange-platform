import { notifyError } from "@/components/toast-notifications"

export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: Record<string, any>
}

export class APIError extends Error implements AppError {
  code: string
  statusCode: number
  context?: Record<string, any>

  constructor(message: string, statusCode = 500, code?: string, context?: Record<string, any>) {
    super(message)
    this.name = "APIError"
    this.statusCode = statusCode
    this.code = code || `API_ERROR_${statusCode}`
    this.context = context
  }
}

export class ValidationError extends Error implements AppError {
  code: string
  statusCode: number
  context?: Record<string, any>

  constructor(message: string, context?: Record<string, any>) {
    super(message)
    this.name = "ValidationError"
    this.statusCode = 400
    this.code = "VALIDATION_ERROR"
    this.context = context
  }
}

export class AuthenticationError extends Error implements AppError {
  code: string
  statusCode: number

  constructor(message = "Authentication required") {
    super(message)
    this.name = "AuthenticationError"
    this.statusCode = 401
    this.code = "AUTHENTICATION_ERROR"
  }
}

export class AuthorizationError extends Error implements AppError {
  code: string
  statusCode: number

  constructor(message = "Access denied") {
    super(message)
    this.name = "AuthorizationError"
    this.statusCode = 403
    this.code = "AUTHORIZATION_ERROR"
  }
}

export class NotFoundError extends Error implements AppError {
  code: string
  statusCode: number

  constructor(message = "Resource not found") {
    super(message)
    this.name = "NotFoundError"
    this.statusCode = 404
    this.code = "NOT_FOUND_ERROR"
  }
}

// Error handler utility functions
export function handleAPIError(error: unknown): AppError {
  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    return new APIError(error.message)
  }

  return new APIError("An unknown error occurred")
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Une erreur inattendue s'est produite"
}

export function logError(error: unknown, context?: Record<string, any>) {
  const errorInfo = {
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  }

  console.error("Application Error:", errorInfo)

  // In production, you would send this to an error tracking service
  // like Sentry, LogRocket, or Bugsnag
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }
}

export function handleAsyncError<T>(promise: Promise<T>, errorMessage?: string): Promise<[T | null, AppError | null]> {
  return promise
    .then<[T, null]>((data: T) => [data, null])
    .catch<[null, AppError]>((error: unknown) => {
      const appError = handleAPIError(error)
      if (errorMessage) {
        appError.message = errorMessage
      }
      logError(appError)
      return [null, appError]
    })
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: unknown, showToast = true) => {
    const appError = handleAPIError(error)
    logError(appError)

    if (showToast) {
      notifyError("Erreur", appError.message)
    }

    return appError
  }

  return { handleError }
}

// Form error utilities
export function getFieldError(errors: Record<string, any>, fieldName: string): string | undefined {
  const error = errors[fieldName]
  if (!error) return undefined

  if (typeof error === "string") return error
  if (error.message) return error.message
  if (Array.isArray(error) && error.length > 0) return error[0]

  return "Erreur de validation"
}

export function hasFieldError(errors: Record<string, any>, fieldName: string): boolean {
  return Boolean(errors[fieldName])
}
