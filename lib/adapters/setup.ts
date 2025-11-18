/**
 * Setup and initialize adapters based on environment configuration
 */

import { adapterRegistry } from './index'
import {
  StubNotificationAdapter,
  HttpNotificationAdapter,
  StubCurrencyAdapter,
  StubQuestAdapter,
  StubProfileAdapter,
  MetricsAdapter,
  StubStorageAdapter,
} from './implementations'

/**
 * Initialize all adapters with appropriate implementations
 * based on environment configuration
 */
export function setupAdapters() {
  // Notification adapter
  const notificationUrl = process.env.NOTIFICATION_HUB_URL
  if (notificationUrl && notificationUrl !== 'stub') {
    adapterRegistry.register('notification', new HttpNotificationAdapter(notificationUrl))
  } else {
    adapterRegistry.register('notification', new StubNotificationAdapter())
  }

  // Currency adapter (stub for now)
  adapterRegistry.register('currency', new StubCurrencyAdapter())

  // Quest adapter (stub for now)
  adapterRegistry.register('quest', new StubQuestAdapter())

  // Profile adapter (stub for now)
  adapterRegistry.register('profile', new StubProfileAdapter())

  // Metrics adapter
  adapterRegistry.register('metrics', new MetricsAdapter())

  // Storage adapter (stub for now)
  adapterRegistry.register('storage', new StubStorageAdapter())

  console.log('[Adapters] Initialized successfully')
}

/**
 * Setup adapters for testing with all stubs
 */
export function setupTestAdapters() {
  adapterRegistry.register('notification', new StubNotificationAdapter())
  adapterRegistry.register('currency', new StubCurrencyAdapter())
  adapterRegistry.register('quest', new StubQuestAdapter())
  adapterRegistry.register('profile', new StubProfileAdapter())
  adapterRegistry.register('metrics', new MetricsAdapter())
  adapterRegistry.register('storage', new StubStorageAdapter())
}
