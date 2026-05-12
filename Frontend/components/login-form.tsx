'use client'

/**
 * The system implements a minimalist login form component.
 * This component handles user authentication via the POST /api/auth/login endpoint.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/lib/services'
import { useAuthStore } from '@/lib/auth-store'

export function LoginForm() {
  const router = useRouter()
  const { setAuth, setLoading, isLoading } = useAuthStore()
  
  const [document, setDocument] = useState('')
  const [password, setPassword] = useState('')
  
  /**
   * The system validates that all required fields are complete.
   */
const isFormValid = document.trim() !== '' && password.trim() !== ''
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) {
      toast.error('Por favor complete todos los campos')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authService.login({ email: document, password })
      
      setAuth(response.user, response.token)
      
      toast.success(`Bienvenido, ${response.user.name || 'Usuario'}`)
      
      // The system redirects to dashboard based on user role
      router.push('/dashboard')
    } catch (error) {
      // The system displays error notification on failure
      const message = error instanceof Error ? error.message : 'Error de autenticación'
      toast.error(message)
      setLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4">
      <Card className="w-full max-w-md border-[#2A2A2A] bg-[#1E1E1E]">
        <CardHeader className="space-y-4 text-center">
          {/* The system displays the application branding */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <img 
              src="/icon.png" 
              alt="Logo SI" 
              className="h-16 w-16 rounded-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-[#E0E0E0]">
              Sistema de Incapacidades
            </CardTitle>
            <CardDescription className="mt-2 text-[#9E9E9E]">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* The system renders the email input field */}
            <div className="space-y-2">
<Label htmlFor="document" className="text-[#E0E0E0]">
                 Documento
               </Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
                 <Input
                   id="document"
                   type="text"
                   placeholder="12345678"
                   value={document}
                   onChange={(e) => setDocument(e.target.value)}
                   className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                   disabled={isLoading}
                   autoComplete="username"
                 />
              </div>
            </div>
            
            {/* The system renders the password input field */}
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
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="border-[#2A2A2A] bg-[#121212] pl-10 text-[#E0E0E0] placeholder:text-[#9E9E9E]/50 focus:border-[#00E5FF] focus:ring-[#00E5FF]"
                   disabled={isLoading}
                   autoComplete="current-password"
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
                   Iniciando sesión...
                 </>
               ) : (
                 'Iniciar sesión'
               )}
             </Button>
           </form>
           
           <div className="mt-6 rounded-lg border border-[#2A2A2A] bg-[#121212] p-4">
             <p className="mb-2 text-xs font-medium text-[#9E9E9E]">Credenciales de prueba:</p>
             <div className="space-y-1 text-xs text-[#9E9E9E]">
               <p><span className="text-[#00E5FF]">Admin:</span> documento "12345678" / password "admin123"</p>
               <p><span className="text-[#00E5FF]">RRHH:</span> documento "87654321" / password "rrhh123"</p>
               <p><span className="text-[#00E5FF]">Contabilidad:</span> documento "11223344" / password "conta123"</p>
             </div>
           </div>
           
           {/* The system provides link to registration page */}
           <div className="mt-4 text-center">
             <button
               onClick={() => router.push('/register')}
               className="text-sm text-[#00E5FF] hover:underline"
             >
               ¿No tiene cuenta? Regístrese aquí
             </button>
           </div>
         </CardContent>
       </Card>
     </div>
   )
}
