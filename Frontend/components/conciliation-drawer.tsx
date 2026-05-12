'use client'

/**
 * The system implements the financial conciliation drawer (CS-06, CS-07).
 * This component allows Contabilidad users to register EPS payments.
 */

import { useState } from 'react'
import { DollarSign, Calendar, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from './status-badge'
import { financeService } from '@/lib/services'
import type { Disability } from '@/lib/types'

interface ConciliationDrawerProps {
  disability: Disability
  isOpen: boolean
  onClose: () => void
}

export function ConciliationDrawer({
  disability,
  isOpen,
  onClose,
}: ConciliationDrawerProps) {
  const [amountPaid, setAmountPaid] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  /**
   * The system validates that all required fields are complete.
   */
  const isFormValid = amountPaid.trim() !== '' && parseFloat(amountPaid) > 0
  
  /**
   * The system handles financial conciliation submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      toast.error('Por favor ingrese un monto válido')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // The system processes conciliation via POST /api/finanzas/conciliar
      await financeService.conciliate(disability.id, parseFloat(amountPaid))
      
      // The system displays success notification
      toast.success('Pago conciliado exitosamente', {
        description: `La incapacidad ${disability.id} ha sido marcada como PAGADA`,
      })
      
      // The system closes the drawer and resets form
      setAmountPaid('')
      setTransactionRef('')
      onClose()
      
      // The system would trigger a refresh of the disabilities list in production
      window.location.reload()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al conciliar pago'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="border-l-[#2A2A2A] bg-[#1E1E1E] sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-[#E0E0E0]">Conciliación Financiera</SheetTitle>
          <SheetDescription className="text-[#9E9E9E]">
            Registre el pago recibido de la EPS para esta incapacidad
          </SheetDescription>
        </SheetHeader>
        
        {/* The system displays disability summary */}
        <div className="mt-6 rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm text-[#00E5FF]">{disability.id}</p>
              <p className="mt-1 font-medium text-[#E0E0E0]">{disability.employeeName}</p>
            </div>
            <StatusBadge status={disability.status} />
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#9E9E9E]">EPS</p>
              <p className="text-[#E0E0E0]">{disability.eps}</p>
            </div>
            <div>
              <p className="text-[#9E9E9E]">Días</p>
              <p className="text-[#E0E0E0]">{disability.totalDays}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[#9E9E9E]">Diagnóstico</p>
              <p className="text-[#E0E0E0]">{disability.diagnosis}</p>
            </div>
          </div>
        </div>
        
        {/* The system renders conciliation form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-[#E0E0E0]">
              Valor pagado por la EPS *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF]"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference" className="text-[#E0E0E0]">
              Referencia de transacción (opcional)
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
              <Input
                id="reference"
                type="text"
                placeholder="Ej: TRX-123456"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF]"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[#E0E0E0]">Fecha de pago</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
              <Input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] focus:border-[#00E5FF]"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#2A2A2A] bg-transparent text-[#E0E0E0] hover:bg-[#2A2A2A]"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#00E676] text-[#121212] hover:bg-[#00E676]/90"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar pago'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
