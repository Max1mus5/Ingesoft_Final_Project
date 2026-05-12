'use client'

/**
 * The system implements a protected route wrapper component.
 * This component ensures only authenticated users can access protected pages.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import type { UserRole } from '@/lib/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    /**
     * The system verifies authentication status on component mount.
     */
    const checkAuth = () => {
      if (!isAuthenticated) {
        // The system redirects unauthenticated users to login
        router.push('/login')
        return
      }
      
      // The system validates role-based access if roles are specified
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // The system redirects unauthorized users to dashboard
        router.push('/dashboard')
        return
      }
      
      setIsChecking(false)
    }
    
    // The system waits for hydration before checking auth
    const timeout = setTimeout(checkAuth, 100)
    return () => clearTimeout(timeout)
  }, [isAuthenticated, user, allowedRoles, router])
  
  // The system displays loading state during authentication check
  if (isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
          <p className="text-[#9E9E9E]">Verificando acceso...</p>
        </div>
      </div>
    )
  }
  
  // The system renders children only for authenticated and authorized users
  return <>{children}</>
}
