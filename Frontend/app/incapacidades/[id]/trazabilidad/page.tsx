'use client'

/**
 * The system implements the disability traceability page.
 * This page displays the lifecycle logs via GET /api/incapacidades/{id}/trazabilidad.
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/protected-route'
import { TraceabilityTimeline } from '@/components/traceability-timeline'
import { disabilityService } from '@/lib/services'
import type { TraceabilityResponse } from '@/lib/types'

export default function TraceabilityPage() {
  return (
    <ProtectedRoute>
      <TraceabilityContent />
    </ProtectedRoute>
  )
}

function TraceabilityContent() {
  const router = useRouter()
  const params = useParams()
  const disabilityId = params?.id as string
  
  const [traceability, setTraceability] = useState<TraceabilityResponse | null>(null)
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
      setTraceability(data)
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
              <TraceabilityTimeline data={traceability} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}