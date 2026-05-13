'use client'

/**
 * The system implements the disability registration page.
 * This page allows creating new disability records via POST /api/incapacidades/.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, FileText, Stethoscope, Hash } from 'lucide-react'
import { ArrowLeft, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/protected-route'
import { disabilityService } from '@/lib/services'

export default function NewDisabilityPage() {
  return (
    <ProtectedRoute allowedRoles={['GESTION_HUMANA', 'ADMIN']}>
      <NewDisabilityContent />
    </ProtectedRoute>
  )
}

function NewDisabilityContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    employeeDocument: '',
    employeeName: '',
    epsId: '1',
    startDate: '',
    endDate: '',
    totalDays: '',
    diagnosis: '',
    diagnosisCode: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Validate required fields
      if (!formData.employeeDocument || !formData.employeeName || !formData.startDate || 
          !formData.endDate || !formData.totalDays || !formData.diagnosisCode) {
        toast.error('Por favor complete todos los campos requeridos')
        setIsLoading(false)
        return
      }

      // Call the actual disability service
      await disabilityService.create({
        employeeDocument: formData.employeeDocument,
        employeeName: formData.employeeName,
        epsId: formData.epsId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: parseInt(formData.totalDays),
        diagnosis: formData.diagnosis,
        diagnosisCode: formData.diagnosisCode,
      })

      toast.success('Incapacidad registrada correctamente')
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar la incapacidad'
      console.error('Error creating disability:', error)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-[#E0E0E0]">Nueva Incapacidad</CardTitle>
            <CardDescription className="text-[#9E9E9E]">
              Registre una nueva incapacidad médica
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeDocument" className="text-[#E0E0E0]">
                  Documento del empleado
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="employeeDocument"
                    type="text"
                    placeholder="1234567890"
                    value={formData.employeeDocument}
                    onChange={(e) => setFormData({...formData, employeeDocument: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeName" className="text-[#E0E0E0]">
                  Nombre del empleado
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="employeeName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-[#E0E0E0]">
                    Fecha inicio
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-[#E0E0E0]">
                    Fecha fin
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-[#E0E0E0]">
                  Diagnóstico
                </Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="diagnosis"
                    type="text"
                    placeholder="Fractura de muñeca"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosisCode" className="text-[#E0E0E0]">
                  Código CIE10
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="diagnosisCode"
                    type="text"
                    placeholder="S52.5"
                    value={formData.diagnosisCode}
                    onChange={(e) => setFormData({...formData, diagnosisCode: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalDays" className="text-[#E0E0E0]">
                  Días totales
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="totalDays"
                    type="number"
                    placeholder="15"
                    value={formData.totalDays}
                    onChange={(e) => setFormData({...formData, totalDays: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#00E5FF] text-[#121212] hover:bg-[#00E5FF]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar incapacidad'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}