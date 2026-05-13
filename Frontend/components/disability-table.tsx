'use client'

/**
 * The system implements the disabilities data table component.
 * This table displays all disability records with status badges and action controls.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MoreHorizontal, 
  FileText, 
  DollarSign, 
  ChevronDown,
  Search,
  Filter
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from './status-badge'
import { ConciliationDrawer } from './conciliation-drawer'
import { cn } from '@/lib/utils'
import type { Disability, DisabilityStatus, UserRole } from '@/lib/types'

interface DisabilityTableProps {
  disabilities: Disability[]
  userRole: UserRole
  onStatusChange: (id: string, status: DisabilityStatus) => void
  isLoading?: boolean
}

const ALL_STATUSES: DisabilityStatus[] = [
  'REGISTRADA',
  'TRANSCRITA',
  'RADICADA',
  'EN_MORA',
  'PAGADA',
  'RECHAZADA',
  'GLOSADA',
  'ARCHIVADA',
]

export function DisabilityTable({
  disabilities,
  userRole,
  onStatusChange,
  isLoading,
}: DisabilityTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DisabilityStatus | 'ALL'>('ALL')
  const [selectedDisability, setSelectedDisability] = useState<Disability | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

// Compute filtered disabilities based on search term and status filter
  const filteredDisabilities = disabilities.filter(disability => {
    // Matches search term (case-insensitive)
    const matchesSearch = disability.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disability.employeeDocument.includes(searchTerm) ||
                         disability.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         disability.id.includes(searchTerm)
     
    // Matches status filter
    const matchesStatus = statusFilter === 'ALL' || disability.status === statusFilter
     
    return matchesSearch && matchesStatus
  })

// Determine if user can change status (ADMIN and GESTION_HUMANA roles)
   const canChangeStatus = userRole === 'ADMIN' || userRole === 'GESTION_HUMANA'
   
   // Determine if user can conciliate (CONTABILIDAD role)
   const canConciliate = userRole === 'CONTABILIDAD'
  
  /**
   * The system handles viewing disability detail.
   */
  const handleViewDetail = (disability: Disability) => {
    router.push(`/incapacidades/${disability.id}`)
  }
  
  /**
   * The system handles opening the conciliation drawer.
   */
  const handleConciliate = (disability: Disability) => {
    setSelectedDisability(disability)
    setIsDrawerOpen(true)
  }
  
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E]">
        <div className="p-4 space-y-4">
          <div className="h-10 w-full rounded bg-[#2A2A2A] animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full rounded bg-[#2A2A2A] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <>
      <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E]">
        {/* The system renders table filters and search */}
        <div className="border-b border-[#2A2A2A] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
              <Input
                placeholder="Buscar por nombre, ID o diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-[#2A2A2A] bg-[#121212] pl-9 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#2A2A2A] bg-[#121212] text-[#E0E0E0] hover:bg-[#2A2A2A]"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === 'ALL' ? 'Todos los estados' : statusFilter}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-[#2A2A2A] bg-[#1E1E1E]">
                <DropdownMenuItem
                  className="text-[#E0E0E0] focus:bg-[#2A2A2A] focus:text-[#E0E0E0]"
                  onClick={() => setStatusFilter('ALL')}
                >
                  Todos los estados
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                {ALL_STATUSES.map(
                  (status) => (
                    <DropdownMenuItem
                      key={status}
                      className="text-[#E0E0E0] focus:bg-[#2A2A2A] focus:text-[#E0E0E0]"
                      onClick={() => setStatusFilter(status)}
                    >
                      <StatusBadge status={status} className="mr-2" />
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* The system renders the data table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-[#9E9E9E] font-medium">ID</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium">Empleado</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium">Diagnóstico</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium">Período</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium">Días</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium">EPS</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium">Estado</TableHead>
                <TableHead className="text-[#9E9E9E] font-medium text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisabilities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-[#9E9E9E]"
                  >
                    No se encontraron incapacidades
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisabilities.map((disability) => (
                  <TableRow
                    key={disability.id}
                    className={cn(
                      'border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/30',
                      disability.daysUntilExpiration <= 30 &&
                        disability.status !== 'PAGADA' &&
                        'bg-[#FF5252]/5'
                    )}
                  >
                    <TableCell className="font-mono text-sm text-[#00E5FF]">
                      {disability.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#E0E0E0]">{disability.employeeName}</p>
                        <p className="text-xs text-[#9E9E9E]">{disability.employeeDocument}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-[#E0E0E0]">{disability.diagnosis}</p>
                        <p className="text-xs text-[#9E9E9E]">CIE: {disability.diagnosisCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#E0E0E0]">
                      {disability.startDate} - {disability.endDate}
                    </TableCell>
                    <TableCell className="text-sm text-[#E0E0E0]">
                      {disability.totalDays}
                    </TableCell>
                    <TableCell className="text-sm text-[#E0E0E0]">
                      {disability.eps}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={disability.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-[#9E9E9E] hover:bg-[#2A2A2A] hover:text-[#E0E0E0]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-[#2A2A2A] bg-[#1E1E1E]"
                        >
                          <DropdownMenuLabel className="text-[#9E9E9E]">
                            Acciones
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                          
                          <DropdownMenuItem 
                            className="text-[#E0E0E0] focus:bg-[#2A2A2A] focus:text-[#E0E0E0]"
                            onClick={() => handleViewDetail(disability)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Ver detalle
                          </DropdownMenuItem>
                          
                          {/* The system shows status change options only for authorized roles */}
                          {canChangeStatus && (
                            <>
                              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                              <DropdownMenuLabel className="text-[#9E9E9E] text-xs">
                                Cambiar estado
                              </DropdownMenuLabel>
                              {ALL_STATUSES
                                .filter((s) => s !== disability.status)
                                .map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    className="text-[#E0E0E0] focus:bg-[#2A2A2A] focus:text-[#E0E0E0]"
                                    onClick={() => onStatusChange(disability.id, status)}
                                  >
                                    <StatusBadge status={status} className="mr-2" />
                                  </DropdownMenuItem>
                                ))}
                            </>
                          )}
                          
                          {/* The system shows conciliation option only for authorized roles */}
                          {canConciliate && (disability.status === 'RADICADA' || disability.status === 'EN_MORA') && (
                            <>
                              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                              <DropdownMenuItem
                                className="text-[#00E676] focus:bg-[#2A2A2A] focus:text-[#00E676]"
                                onClick={() => handleConciliate(disability)}
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Conciliar pago
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* The system displays table footer with count */}
        <div className="border-t border-[#2A2A2A] px-4 py-3">
          <p className="text-sm text-[#9E9E9E]">
            Mostrando {filteredDisabilities.length} de {disabilities.length} incapacidades
          </p>
        </div>
      </div>
      
      {/* The system renders the conciliation drawer for financial module */}
      {selectedDisability && (
        <ConciliationDrawer
          disability={selectedDisability}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedDisability(null)
          }}
        />
      )}
    </>
  )
}
