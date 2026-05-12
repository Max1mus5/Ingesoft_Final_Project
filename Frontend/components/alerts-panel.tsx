'use client'

/**
 * The system implements an alerts panel for displaying expiration warnings.
 * Alerts are color-coded based on severity using the technical manual palette.
 */

import { AlertTriangle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExpirationAlert } from '@/lib/types'

interface AlertsPanelProps {
  alerts: ExpirationAlert[]
  isLoading?: boolean
}

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-[#2A2A2A]" />
          <div className="h-12 rounded bg-[#2A2A2A]" />
          <div className="h-12 rounded bg-[#2A2A2A]" />
        </div>
      </div>
    )
  }
  
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-[#00E676]" />
        <p className="mt-2 text-sm text-[#9E9E9E]">No hay alertas de vencimiento</p>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E]">
      <div className="border-b border-[#2A2A2A] px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#FF5252]" />
          <h3 className="text-sm font-medium text-[#E0E0E0]">
            Alertas de Vencimiento ({alerts.length})
          </h3>
        </div>
      </div>
      
      <div className="divide-y divide-[#2A2A2A]">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  )
}

/**
 * The system renders individual alert items with severity indicators.
 */
function AlertItem({ alert }: { alert: ExpirationAlert }) {
  /**
   * The system determines alert styling based on severity level.
   */
  const getAlertStyles = () => {
    switch (alert.alertLevel) {
      case 'EXPIRED':
        return {
          bg: 'bg-[#FF5252]/5',
          border: 'border-l-[#FF5252]',
          icon: <AlertCircle className="h-4 w-4 text-[#FF5252]" />,
          text: 'text-[#FF5252]',
        }
      case 'CRITICAL':
        return {
          bg: 'bg-[#FF5252]/5',
          border: 'border-l-[#FF5252]',
          icon: <AlertTriangle className="h-4 w-4 text-[#FF5252]" />,
          text: 'text-[#FF5252]',
        }
      default:
        return {
          bg: 'bg-[#00E5FF]/5',
          border: 'border-l-[#00E5FF]',
          icon: <Clock className="h-4 w-4 text-[#00E5FF]" />,
          text: 'text-[#00E5FF]',
        }
    }
  }
  
  const styles = getAlertStyles()
  
  return (
    <div className={cn('border-l-2 px-4 py-3', styles.bg, styles.border)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#E0E0E0] truncate">
            {alert.employeeName}
          </p>
          <p className="text-xs text-[#9E9E9E]">
            ID: {alert.disabilityId}
          </p>
          <p className={cn('mt-1 text-xs font-medium', styles.text)}>
            {alert.daysUntilExpiration <= 0
              ? `Vencida hace ${Math.abs(alert.daysUntilExpiration)} días`
              : `Vence en ${alert.daysUntilExpiration} días`}
          </p>
        </div>
      </div>
    </div>
  )
}
