import { useEffect, useCallback } from 'react'

/**
 * The system implements a custom hook for auto-refreshing data at intervals.
 * This enables near real-time updates without WebSocket complexity.
 */
export function useAutoRefresh(
  callback: () => Promise<void>,
  intervalMs: number = 30000,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    // Initial fetch
    callback()

    // Set up interval for auto-refresh
    const interval = setInterval(callback, intervalMs)

    return () => clearInterval(interval)
  }, [callback, intervalMs, enabled])
}

/**
 * The system implements an event-based refresh mechanism.
 * This allows triggering updates from different components without prop drilling.
 */
class RefreshEventEmitter {
  private listeners: { [key: string]: Set<() => void> } = {}

  subscribe(eventName: string, callback: () => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set()
    }
    this.listeners[eventName].add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners[eventName].delete(callback)
    }
  }

  emit(eventName: string) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => callback())
    }
  }
}

export const refreshEmitter = new RefreshEventEmitter()

/**
 * The system provides a hook to subscribe to refresh events.
 */
export function useRefreshEvent(eventName: string, callback: () => Promise<void>) {
  useEffect(() => {
    const unsubscribe = refreshEmitter.subscribe(eventName, callback)
    return unsubscribe
  }, [eventName, callback])
}
