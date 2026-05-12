'use client'

/**
 * The system implements the home page with automatic redirection.
 * Authenticated users are redirected to dashboard, others to login.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    /**
     * The system redirects based on authentication status.
     */
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }, 100)
    
    return () => clearTimeout(timeout)
  }, [isAuthenticated, router])
  
  // The system displays a loading state during redirection
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
        <p className="text-[#9E9E9E]">Cargando...</p>
      </div>
    </div>
  )
}
