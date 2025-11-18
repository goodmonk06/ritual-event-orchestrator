/**
 * Default implementations of adapters (stub/in-memory versions)
 * These can be swapped with real implementations
 */

import { logger } from '../logger'
import { metrics as metricsCollector } from '../metrics'
import type {
  INotificationAdapter,
  ICurrencyAdapter,
  IQuestAdapter,
  IProfileAdapter,
  IMetricsAdapter,
  IStorageAdapter,
  NotificationPayload,
  RewardPayload,
  QuestProgressPayload,
} from './index'

/**
 * Stub notification adapter (logs to console)
 */
export class StubNotificationAdapter implements INotificationAdapter {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    logger.logIntegration('notification', 'send', {
      recipientCount: payload.recipientIds.length,
      template: payload.templateKey,
    })
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.sendNotification(payload)
    }
  }
}

/**
 * HTTP notification adapter (makes real HTTP calls)
 */
export class HttpNotificationAdapter implements INotificationAdapter {
  constructor(private baseUrl: string) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Notification failed: ${response.statusText}`)
      }

      logger.logIntegration('notification', 'sent', {
        recipientCount: payload.recipientIds.length,
      })
    } catch (error) {
      logger.error('Notification failed', error)
      throw error
    }
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    await Promise.all(payloads.map(p => this.sendNotification(p)))
  }
}

/**
 * Stub currency adapter (logs to console)
 */
export class StubCurrencyAdapter implements ICurrencyAdapter {
  private balances: Map<string, number> = new Map()

  async awardCurrency(payload: RewardPayload): Promise<void> {
    const current = this.balances.get(payload.memberId) || 0
    this.balances.set(payload.memberId, current + payload.amount)

    logger.logIntegration('currency', 'award', {
      memberId: payload.memberId,
      amount: payload.amount,
      reason: payload.reason,
    })
  }

  async awardBulk(payloads: RewardPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.awardCurrency(payload)
    }
  }

  async getBalance(memberId: string): Promise<number> {
    return this.balances.get(memberId) || 0
  }
}

/**
 * Stub quest adapter (logs to console)
 */
export class StubQuestAdapter implements IQuestAdapter {
  private progress: Map<string, Set<string>> = new Map()

  async markStepComplete(payload: QuestProgressPayload): Promise<void> {
    const key = `${payload.memberId}:${payload.questKey}`
    const steps = this.progress.get(key) || new Set()
    steps.add(payload.stepKey)
    this.progress.set(key, steps)

    logger.logIntegration('quest', 'step_complete', {
      memberId: payload.memberId,
      questKey: payload.questKey,
      stepKey: payload.stepKey,
    })
  }

  async markStepsBulk(payloads: QuestProgressPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.markStepComplete(payload)
    }
  }

  async getProgress(memberId: string, questKey: string): Promise<unknown> {
    const key = `${memberId}:${questKey}`
    const steps = this.progress.get(key) || new Set()
    return {
      memberId,
      questKey,
      completedSteps: Array.from(steps),
      totalSteps: steps.size,
    }
  }
}

/**
 * Stub profile adapter (returns mock data)
 */
export class StubProfileAdapter implements IProfileAdapter {
  async getProfile(memberId: string) {
    return {
      id: memberId,
      name: `Member ${memberId}`,
      email: `${memberId}@example.com`,
      metadata: {},
    }
  }

  async getProfiles(memberIds: string[]) {
    const profiles = new Map()
    for (const id of memberIds) {
      const profile = await this.getProfile(id)
      if (profile) {
        profiles.set(id, profile)
      }
    }
    return profiles
  }
}

/**
 * Metrics adapter (delegates to our metrics collector)
 */
export class MetricsAdapter implements IMetricsAdapter {
  increment(metric: string, value: number = 1, labels?: Record<string, string>): void {
    metricsCollector.incrementCounter(metric, labels, value)
  }

  gauge(metric: string, value: number, labels?: Record<string, string>): void {
    metricsCollector.setGauge(metric, value, labels)
  }

  histogram(metric: string, value: number, labels?: Record<string, string>): void {
    metricsCollector.recordHistogram(metric, value, labels)
  }
}

/**
 * Stub storage adapter (in-memory storage)
 */
export class StubStorageAdapter implements IStorageAdapter {
  private storage: Map<string, Buffer> = new Map()

  async upload(key: string, data: Buffer): Promise<string> {
    this.storage.set(key, data)
    logger.info('File uploaded', { key, size: data.length })
    return `stub://${key}`
  }

  async download(key: string): Promise<Buffer> {
    const data = this.storage.get(key)
    if (!data) {
      throw new Error(`File not found: ${key}`)
    }
    return data
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key)
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `stub://${key}?expires=${expiresIn}`
  }
}
