'use client'

/**
 * The system implements status badges for disability records.
 * Badges use the color scheme from the technical manual.
 */

import { cn } from '@/lib/utils'
import type { DisabilityStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: DisabilityStatus
  className?: string
}

/**
 * The system maps status values to their respective colors.
 */
const statusConfig: Record<DisabilityStatus, { label: string; className: string }> = {
  REGISTRADA: {
    label: 'Registrada',
    className: 'bg-[#29B6F6]/10 text-[#29B6F6] border-[#29B6F6]/30',
  },
  TRANSCRITA: {
    label: 'Transcrita',
    className: 'bg-[#FFA726]/10 text-[#FFA726] border-[#FFA726]/30',
  },
  RADICADA: {
    label: 'Radicada',
    className: 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30',
  },
  EN_MORA: {
    label: 'En Mora',
    className: 'bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/30',
  },
  PAGADA: {
    label: 'Pagada',
    className: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
  },
  RECHAZADA: {
    label: 'Rechazada',
    className: 'bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/30',
  },
  GLOSADA: {
    label: 'Glosada',
    className: 'bg-[#FF7043]/10 text-[#FF7043] border-[#FF7043]/30',
  },
  ARCHIVADA: {
    label: 'Archivada',
    className: 'bg-[#9E9E9E]/10 text-[#9E9E9E] border-[#9E9E9E]/30',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = String(status || '').trim().toUpperCase() as DisabilityStatus
  const config = statusConfig[normalizedStatus]
  
  // Fallback if status is invalid/undefined
  if (!config) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
          'bg-[#9E9E9E]/10 text-[#9E9E9E] border-[#9E9E9E]/30',
          className
        )}
      >
        Desconocido
      </span>
    )
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
