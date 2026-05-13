'use client'

/**
 * The system renders a complete timeline for disability state traceability.
 * The timeline includes all possible states and the exact timestamp for reached states.
 */

import { Clock, CheckCircle2, CircleDot } from 'lucide-react'
import { StatusBadge } from './status-badge'
import type { TraceabilityResponse } from '@/lib/types'

interface TraceabilityTimelineProps {
  data: TraceabilityResponse | null
  isLoading?: boolean
}

function formatTimestamp(value: string | null): string {
  if (!value) return 'No alcanzado'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function TraceabilityTimeline({ data, isLoading }: TraceabilityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded bg-[#2A2A2A] animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data || data.timeline.length === 0) {
    return <p className="text-sm text-[#9E9E9E]">No hay eventos de trazabilidad registrados.</p>
  }

  return (
    <div className="space-y-0">
      {data.timeline.map((item, index) => {
        const isLast = index === data.timeline.length - 1

        return (
          <div key={item.estado} className="relative pl-8 pb-5">
            {!isLast && <div className="absolute left-2.75 top-6 h-full w-px bg-[#2A2A2A]" />}

            <div className="absolute left-0 top-1">
              {item.esActual ? (
                <CircleDot className="h-5 w-5 text-[#00E5FF]" />
              ) : item.alcanzado ? (
                <CheckCircle2 className="h-5 w-5 text-[#00E676]" />
              ) : (
                <Clock className="h-5 w-5 text-[#9E9E9E]" />
              )}
            </div>

            <div className="rounded-md border border-[#2A2A2A] bg-[#121212] p-3">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={item.estado} />
                <span className="text-xs text-[#9E9E9E]">
                  {item.esActual ? 'Estado actual' : item.alcanzado ? 'Estado completado' : 'Pendiente'}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#E0E0E0]">{formatTimestamp(item.fechaCambio)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
