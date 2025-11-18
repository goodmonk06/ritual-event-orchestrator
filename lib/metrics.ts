/**
 * Metrics abstraction for tracking system health and usage
 * Currently stores in-memory; can be swapped with Prometheus/StatsD later
 */

interface MetricLabels {
  [key: string]: string | number
}

interface CounterMetric {
  name: string
  value: number
  labels: MetricLabels
  timestamp: Date
}

interface GaugeMetric {
  name: string
  value: number
  labels: MetricLabels
  timestamp: Date
}

interface HistogramMetric {
  name: string
  value: number
  labels: MetricLabels
  timestamp: Date
}

class MetricsCollector {
  private counters: Map<string, CounterMetric[]> = new Map()
  private gauges: Map<string, GaugeMetric> = new Map()
  private histograms: Map<string, HistogramMetric[]> = new Map()

  private getMetricKey(name: string, labels?: MetricLabels): string {
    if (!labels) return name
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',')
    return `${name}{${labelStr}}`
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: MetricLabels, value: number = 1): void {
    const key = this.getMetricKey(name, labels)
    const existing = this.counters.get(key) || []
    existing.push({
      name,
      value,
      labels: labels || {},
      timestamp: new Date(),
    })
    this.counters.set(key, existing)

    // Keep only last 1000 entries per metric
    if (existing.length > 1000) {
      existing.shift()
    }
  }

  /**
   * Set a gauge metric (current value)
   */
  setGauge(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getMetricKey(name, labels)
    this.gauges.set(key, {
      name,
      value,
      labels: labels || {},
      timestamp: new Date(),
    })
  }

  /**
   * Record a histogram value (for timing, sizes, etc.)
   */
  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getMetricKey(name, labels)
    const existing = this.histograms.get(key) || []
    existing.push({
      name,
      value,
      labels: labels || {},
      timestamp: new Date(),
    })
    this.histograms.set(key, existing)

    // Keep only last 1000 entries
    if (existing.length > 1000) {
      existing.shift()
    }
  }

  /**
   * Get all metrics (for debugging or export)
   */
  getAllMetrics() {
    return {
      counters: Array.from(this.counters.entries()).map(([key, values]) => ({
        key,
        total: values.reduce((sum, v) => sum + v.value, 0),
        count: values.length,
        latest: values[values.length - 1],
      })),
      gauges: Array.from(this.gauges.entries()).map(([key, value]) => ({
        key,
        ...value,
      })),
      histograms: Array.from(this.histograms.entries()).map(([key, values]) => {
        const sorted = values.map(v => v.value).sort((a, b) => a - b)
        return {
          key,
          count: values.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          median: sorted[Math.floor(sorted.length / 2)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
        }
      }),
    }
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }
}

// Singleton instance
export const metrics = new MetricsCollector()

// Domain-specific metric helpers
export const ritualMetrics = {
  recordInstanceCreated(ritualType: string) {
    metrics.incrementCounter('ritual_instance_created', { ritualType })
  },

  recordInstanceCompleted(ritualType: string, participantCount: number) {
    metrics.incrementCounter('ritual_instance_completed', { ritualType })
    metrics.recordHistogram('ritual_participant_count', participantCount, { ritualType })
  },

  recordParticipantCheckIn(ritualType: string) {
    metrics.incrementCounter('ritual_participant_checkin', { ritualType })
  },

  recordIntegrationCall(integration: string, success: boolean) {
    metrics.incrementCounter('integration_call', { integration, status: success ? 'success' : 'failure' })
  },

  setActiveRituals(count: number) {
    metrics.setGauge('active_rituals', count)
  },

  recordApiLatency(endpoint: string, durationMs: number) {
    metrics.recordHistogram('api_latency_ms', durationMs, { endpoint })
  },
}
