'use client'

/**
 * The system implements a registration form component.
 * This component handles new user registration via the POST /api/auth/registrar endpoint.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/lib/services'
import { useAuthStore } from '@/lib/auth-store'
import type { UserRole } from '@/lib/types'

export function RegisterForm() {
  const router = useRouter()
  const { setAuth, setLoading, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    role: 'COLABORADOR' as UserRole,
    password: '',
    confirmPassword: '',
  })
  
  const isFormValid = 
    formData.name.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.document.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.password === formData.confirmPassword
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
      } else {
        toast.error('Por favor complete todos los campos')
      }
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        document: formData.document,
        role: formData.role,
        password: formData.password,
      })
      
      setAuth(response.user, response.token)
      toast.success(`Usuario registrado exitosamente, ${response.user.name}`)
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar usuario'
      toast.error(message)
      setLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4">
      <Card className="w-full max-w-md border-[#2A2A2A] bg-[#1E1E1E]">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00E5FF]/10">
            <img 
              src="/icon.png" 
              alt="Logo SI" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-[#E0E0E0]">
              Crear Cuenta
            </CardTitle>
            <CardDescription className="mt-2 text-[#9E9E9E]">
              Regístrese para acceder al sistema
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#E0E0E0]">
                Nombre completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
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
                  placeholder="usuario@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document" className="text-[#E0E0E0]">
                Documento
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                <Input
                  id="document"
                  type="text"
                  placeholder="1234567890"
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#E0E0E0]">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#E0E0E0]">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#00E5FF] font-medium text-[#121212] hover:bg-[#00E5FF]/90 disabled:opacity-50"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-[#00E5FF] hover:underline"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}