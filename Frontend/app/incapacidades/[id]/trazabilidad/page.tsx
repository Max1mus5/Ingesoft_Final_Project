'use client'

/**
 * The system implements the disability traceability page.
 * This page displays the lifecycle logs via GET /api/incapacidades/{id}/trazabilidad.
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/protected-route'
import { disabilityService } from '@/lib/services'

interface TraceEvent {
  evento: string
  fecha: string
}

export default function TraceabilityPage() {
  return (
    <ProtectedRoute>
      <TraceabilityContent />
    </ProtectedRoute>
  )
}

function TraceabilityContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const disabilityId = searchParams.get('id')
  
  const [logs, setLogs] = useState<TraceEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (disabilityId) {
      fetchData()
    }
  }, [disabilityId])

  const fetchData = async () => {
    try {
      // The system would fetch from GET /api/incapacidades/{id}/trazabilidad in production
      const data = await disabilityService.getTraceability(disabilityId!)
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Error fetching traceability:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
          <p className="text-[#9E9E9E]">Cargando trazabilidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-[#9E9E9E] hover:text-[#E0E0E0]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <Card className="border-[#2A2A2A] bg-[#1E1E1E]">
          <CardHeader>
            <CardTitle className="text-[#E0E0E0]">Trazabilidad</CardTitle>
            <CardDescription className="text-[#9E9E9E]">
              Historial de cambios de la incapacidad {disabilityId}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <p className="text-center text-[#9E9E9E]">No hay eventos registrados</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 border-l-2 border-[#00E5FF] pl-4">
                    <Clock className="mt-0.5 h-4 w-4 text-[#00E5FF]" />
                    <div>
                      <p className="font-medium text-[#E0E0E0]">{log.evento}</p>
                      <p className="text-xs text-[#9E9E9E]">{log.fecha}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}