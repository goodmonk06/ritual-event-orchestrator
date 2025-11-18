/**
 * Centralized logging utility with contextual information
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  // Domain-specific logging helpers
  logRitualEvent(event: string, ritualInstanceId: string, context?: LogContext): void {
    this.info(`Ritual event: ${event}`, {
      ritualInstanceId,
      ...context,
    })
  }

  logIntegration(integration: string, action: string, context?: LogContext): void {
    this.info(`Integration: ${integration} - ${action}`, context)
  }

  logApiRequest(method: string, path: string, context?: LogContext): void {
    this.debug(`API ${method} ${path}`, context)
  }
}

export const logger = new Logger()
