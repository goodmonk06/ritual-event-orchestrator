/**
 * Domain event emitter and handler registry
 */

import { randomUUID } from 'crypto'
import { logger } from '../logger'
import type { DomainEvent, EventType, EventHandler } from './types'

class EventEmitter {
  private handlers: Map<EventType, Set<EventHandler>> = new Map()
  private globalHandlers: Set<EventHandler> = new Set()

  /**
   * Register a handler for a specific event type
   */
  on<T extends DomainEvent>(eventType: T['eventType'], handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler as EventHandler)
  }

  /**
   * Register a handler for all events
   */
  onAny(handler: EventHandler): void {
    this.globalHandlers.add(handler)
  }

  /**
   * Unregister a handler
   */
  off<T extends DomainEvent>(eventType: T['eventType'], handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.delete(handler as EventHandler)
    }
  }

  /**
   * Unregister a global handler
   */
  offAny(handler: EventHandler): void {
    this.globalHandlers.delete(handler)
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit<T extends DomainEvent>(
    eventType: T['eventType'],
    payload: T['payload'],
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event: DomainEvent = {
      eventId: randomUUID(),
      eventType: eventType as EventType,
      timestamp: new Date(),
      payload: payload as any,
      metadata,
    }

    logger.debug(`Event emitted: ${eventType}`, { eventId: event.eventId })

    // Get specific handlers for this event type
    const specificHandlers = this.handlers.get(eventType) || new Set()

    // Combine specific and global handlers
    const allHandlers = [...Array.from(specificHandlers), ...Array.from(this.globalHandlers)]

    // Execute all handlers (in parallel for performance, but could be sequential if needed)
    const results = await Promise.allSettled(
      allHandlers.map(handler => Promise.resolve(handler(event)))
    )

    // Log any handler failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error(`Event handler failed for ${eventType}`, result.reason, {
          eventId: event.eventId,
          handlerIndex: index,
        })
      }
    })
  }

  /**
   * Emit an event synchronously (handlers run in background)
   */
  emitAsync<T extends DomainEvent>(
    eventType: T['eventType'],
    payload: T['payload'],
    metadata?: Record<string, unknown>
  ): void {
    // Fire and forget - handlers run in background
    this.emit(eventType, payload, metadata).catch(error => {
      logger.error(`Failed to emit event ${eventType}`, error)
    })
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear()
    this.globalHandlers.clear()
  }

  /**
   * Get count of handlers for an event type
   */
  listenerCount(eventType?: EventType): number {
    if (eventType) {
      return (this.handlers.get(eventType)?.size || 0) + this.globalHandlers.size
    }
    return Array.from(this.handlers.values()).reduce((sum, set) => sum + set.size, 0) + this.globalHandlers.size
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter()

// Re-export types for convenience
export type { DomainEvent, EventType, EventHandler }
