/**
 * Adapter pattern for external integrations
 * Provides clean interfaces that can be swapped or mocked
 */

export interface NotificationPayload {
  recipientIds: string[]
  templateKey: string
  data: Record<string, unknown>
}

export interface INotificationAdapter {
  sendNotification(payload: NotificationPayload): Promise<void>
  sendBulk(payloads: NotificationPayload[]): Promise<void>
}

export interface RewardPayload {
  memberId: string
  amount: number
  reason: string
  metadata: Record<string, unknown>
}

export interface ICurrencyAdapter {
  awardCurrency(payload: RewardPayload): Promise<void>
  awardBulk(payloads: RewardPayload[]): Promise<void>
  getBalance(memberId: string): Promise<number>
}

export interface QuestProgressPayload {
  memberId: string
  questKey: string
  stepKey: string
  completedAt: Date
  metadata: Record<string, unknown>
}

export interface IQuestAdapter {
  markStepComplete(payload: QuestProgressPayload): Promise<void>
  markStepsBulk(payloads: QuestProgressPayload[]): Promise<void>
  getProgress(memberId: string, questKey: string): Promise<unknown>
}

export interface IProfileAdapter {
  getProfile(memberId: string): Promise<{
    id: string
    name: string
    email?: string
    metadata?: Record<string, unknown>
  } | null>
  getProfiles(memberIds: string[]): Promise<Map<string, {
    id: string
    name: string
    email?: string
    metadata?: Record<string, unknown>
  }>>
}

export interface IMetricsAdapter {
  increment(metric: string, value?: number, labels?: Record<string, string>): void
  gauge(metric: string, value: number, labels?: Record<string, string>): void
  histogram(metric: string, value: number, labels?: Record<string, string>): void
}

export interface IStorageAdapter {
  upload(key: string, data: Buffer, metadata?: Record<string, string>): Promise<string>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

/**
 * Adapter registry for dependency injection
 */
class AdapterRegistry {
  private adapters: Map<string, unknown> = new Map()

  register<T>(key: string, adapter: T): void {
    this.adapters.set(key, adapter)
  }

  get<T>(key: string): T {
    const adapter = this.adapters.get(key)
    if (!adapter) {
      throw new Error(`Adapter not registered: ${key}`)
    }
    return adapter as T
  }

  has(key: string): boolean {
    return this.adapters.has(key)
  }

  clear(): void {
    this.adapters.clear()
  }
}

export const adapterRegistry = new AdapterRegistry()

// Convenience getters
export const getNotificationAdapter = () => adapterRegistry.get<INotificationAdapter>('notification')
export const getCurrencyAdapter = () => adapterRegistry.get<ICurrencyAdapter>('currency')
export const getQuestAdapter = () => adapterRegistry.get<IQuestAdapter>('quest')
export const getProfileAdapter = () => adapterRegistry.get<IProfileAdapter>('profile')
export const getMetricsAdapter = () => adapterRegistry.get<IMetricsAdapter>('metrics')
export const getStorageAdapter = () => adapterRegistry.get<IStorageAdapter>('storage')
