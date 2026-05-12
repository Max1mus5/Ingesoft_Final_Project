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
  RADICADA: {
    label: 'Radicada',
    className: 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30',
  },
  EN_MORA: {
    label: 'En Mora',
    className: 'bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/30',
  },
  APROBADA: {
    label: 'Aprobada',
    className: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
  },
  PAGADA: {
    label: 'Pagada',
    className: 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30',
  },
  RECHAZADA: {
    label: 'Rechazada',
    className: 'bg-[#FF5252]/10 text-[#FF5252] border-[#FF5252]/30',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
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
