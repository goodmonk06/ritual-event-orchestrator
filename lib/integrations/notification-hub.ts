/**
 * Stub client for unified-notification-hub service
 * Sends follow-up messages after ritual completion
 */

export interface NotificationPayload {
  recipientIds: string[]
  templateKey: string
  data: Record<string, unknown>
}

export class NotificationHubClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NOTIFICATION_HUB_URL || 'http://localhost:3001'
  }

  async sendBulkNotification(payload: NotificationPayload): Promise<void> {
    console.log('[NotificationHub] Sending bulk notification:', {
      url: `${this.baseUrl}/api/notifications/bulk`,
      recipientCount: payload.recipientIds.length,
      templateKey: payload.templateKey,
    })

    // Stub implementation - in production this would make actual HTTP call
    try {
      // await fetch(`${this.baseUrl}/api/notifications/bulk`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // })
      console.log('[NotificationHub] ✓ Notification sent (stub)')
    } catch (error) {
      console.error('[NotificationHub] Failed to send notification:', error)
      throw error
    }
  }

  async sendRitualCompletionNotification(
    ritualInstanceId: string,
    participantIds: string[],
    ritualName: string
  ): Promise<void> {
    await this.sendBulkNotification({
      recipientIds: participantIds,
      templateKey: 'ritual_completion',
      data: {
        ritualInstanceId,
        ritualName,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

export const notificationHub = new NotificationHubClient()
