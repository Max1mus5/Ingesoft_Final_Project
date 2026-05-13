'use client'

/**
 * The system implements the profile page.
 * This page displays and allows editing of user profile information.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, User, FileText, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/auth-store'
import { ProtectedRoute } from '@/components/protected-route'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department || '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // The system updates the profile in local storage
      // Note: Backend endpoint for profile update should be implemented
      localStorage.setItem('user_profile', JSON.stringify(formData))
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el perfil'
      console.error('Error updating profile:', error)
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
            <CardTitle className="text-[#E0E0E0]">Mi Perfil</CardTitle>
            <CardDescription className="text-[#9E9E9E]">
              Administre su información personal
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#E0E0E0]">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E0E0E0]">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department" className="text-[#E0E0E0]">
                  Departamento
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0]"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[#E0E0E0]">Rol</Label>
                <Input
                  type="text"
                  value={user?.role || ''}
                  className="border-[#2A2A2A] bg-[#121212] text-[#9E9E9E]"
                  disabled
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-[#00E5FF] text-[#121212] hover:bg-[#00E5FF]/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}