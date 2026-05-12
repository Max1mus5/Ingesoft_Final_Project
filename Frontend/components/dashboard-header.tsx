'use client'

/**
 * The system implements the dashboard header component.
 * This component displays user information and navigation controls.
 */

import { LogOut, User, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'
import { authService } from '@/lib/services'

interface DashboardHeaderProps {
  alertCount?: number
}

export function DashboardHeader({ alertCount = 0 }: DashboardHeaderProps) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  
  /**
   * The system handles user logout.
   */
  const handleLogout = () => {
    authService.logout()
    clearAuth()
    toast.success('Sesión cerrada correctamente')
    router.push('/login')
  }
  
  /**
   * The system formats user role for display.
   */
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      ADMIN: 'Administrador',
      GESTION_HUMANA: 'Gestión Humana',
      CONTABILIDAD: 'Contabilidad',
      COLABORADOR: 'Colaborador',
    }
    return roleMap[role] || role
  }
  
  return (
    <header className="sticky top-0 z-50 border-b border-[#2A2A2A] bg-[#1E1E1E]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* The system displays application branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/icon.png" 
              alt="Logo SI" 
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="hidden font-semibold text-[#E0E0E0] sm:inline">
              Sistema de Incapacidades
            </span>
          </div>
        </div>
        
        {/* The system displays action buttons and user menu */}
        <div className="flex items-center gap-3">
          {/* The system renders alert notification button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[#9E9E9E] hover:bg-[#2A2A2A] hover:text-[#E0E0E0]"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5252] text-xs font-medium text-white">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
            <span className="sr-only">Notificaciones</span>
          </Button>
          
          {/* The system renders user dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-[#E0E0E0] hover:bg-[#2A2A2A]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5FF]/10">
                  <User className="h-4 w-4 text-[#00E5FF]" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-[#9E9E9E]">{user && formatRole(user.role)}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-[#2A2A2A] bg-[#1E1E1E]"
            >
              <DropdownMenuLabel className="text-[#E0E0E0]">
                Mi cuenta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
<DropdownMenuItem className="text-[#E0E0E0] focus:bg-[#2A2A2A] focus:text-[#E0E0E0]" onClick={() => router.push('/profile')}>
                 <User className="mr-2 h-4 w-4" />
                 Perfil
               </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
              <DropdownMenuItem
                className="text-[#FF5252] focus:bg-[#2A2A2A] focus:text-[#FF5252]"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}