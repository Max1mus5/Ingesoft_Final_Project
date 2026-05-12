'use client'

/**
 * The system implements the disability detail page.
 * This page displays complete information about a specific disability via GET /api/incapacidades/{id}.
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft, Calendar, FileText, Stethoscope, User, Building, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { ProtectedRoute } from '@/components/protected-route'
import { ConciliationDrawer } from '@/components/conciliation-drawer'
import { disabilityService } from '@/lib/services'
import type { Disability } from '@/lib/types'

export default function DisabilityDetailPage() {
  return (
    <ProtectedRoute>
      <DisabilityDetailContent />
    </ProtectedRoute>
  )
}

function DisabilityDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const disabilityId = searchParams.get('id')
  
  const [disability, setDisability] = useState<Disability | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    if (disabilityId) {
      fetchData()
    }
  }, [disabilityId])

  const fetchData = async () => {
    try {
      // The system would fetch from GET /api/incapacidades/{id} in production
      const data = await disabilityService.getById(disabilityId!)
      setDisability(data || null)
    } catch (error) {
      console.error('Error fetching disability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
          <p className="text-[#9E9E9E]">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (!disability) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="text-center">
          <p className="text-[#E0E0E0]">Incapacidad no encontrada</p>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-[#00E5FF]"
          >
            Volver al dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-[#9E9E9E] hover:text-[#E0E0E0]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main details */}
          <div className="lg:col-span-2">
            <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-[#E0E0E0]">
                      Incapacidad {disability.id}
                    </CardTitle>
                    <CardDescription className="text-[#9E9E9E]">
                      Detalles completos de la incapacidad médica
                    </CardDescription>
                  </div>
                  <StatusBadge status={disability.status} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Employee info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#9E9E9E]">Empleado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Nombre</p>
                      <p className="text-[#E0E0E0]">{disability.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Documento</p>
                      <p className="text-[#E0E0E0]">{disability.employeeDocument}</p>
                    </div>
                  </div>
                </div>
                
                {/* EPS info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#9E9E9E]">EPS</h3>
                  <p className="text-[#E0E0E0]">{disability.eps}</p>
                </div>
                
                {/* Period */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#9E9E9E]">Período</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Fecha inicio</p>
                      <p className="text-[#E0E0E0]">{disability.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Fecha fin</p>
                      <p className="text-[#E0E0E0]">{disability.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Días totales</p>
                      <p className="text-[#E0E0E0]">{disability.totalDays}</p>
                    </div>
                  </div>
                </div>
                
                {/* Diagnosis */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#9E9E9E]">Diagnóstico</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Descripción</p>
                      <p className="text-[#E0E0E0]">{disability.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Código CIE10</p>
                      <p className="text-[#E0E0E0]">{disability.diagnosisCode}</p>
                    </div>
                  </div>
                </div>
                
                {/* Dates */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#9E9E9E]">Fechas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Fecha creación</p>
                      <p className="text-[#E0E0E0]">{disability.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9E9E9E]">Última actualización</p>
                      <p className="text-[#E0E0E0]">{disability.updatedAt}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Actions sidebar */}
          <div>
            <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
              <CardHeader>
                <CardTitle className="text-[#E0E0E0]">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {disability.status === 'APROBADA' && (
                  <Button
                    className="w-full bg-[#00E676] text-[#121212] hover:bg-[#00E676]/90"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    Conciliar pago
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full border-[#2A2A2A] bg-transparent text-[#E0E0E0] hover:bg-[#2A2A2A]"
                  onClick={() => router.push(`/incapacidades/${disability.id}/trazabilidad`)}
                >
                  Ver trazabilidad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Conciliation drawer */}
        {disability && (
          <ConciliationDrawer
            disability={disability}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  )
}