/**
 * Centralized error handling for consistent API responses
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, `${resource}${id ? ` with id ${id}` : ''} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, message, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export interface ErrorResponse {
  error: {
    message: string
    code?: string
    statusCode: number
    details?: unknown
  }
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      },
    }
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }

    if (prismaError.code === 'P2002') {
      return {
        error: {
          message: 'A record with this unique field already exists',
          code: 'UNIQUE_CONSTRAINT',
          statusCode: 409,
          details: prismaError.meta,
        },
      }
    }

    if (prismaError.code === 'P2025') {
      return {
        error: {
          message: 'Record not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      }
    }
  }

  // Default error
  console.error('Unhandled error:', error)
  return {
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  }
}

export function handleApiError(error: unknown): Response {
  const errorResponse = formatErrorResponse(error)
  return Response.json(errorResponse, {
    status: errorResponse.error.statusCode,
  })
}
