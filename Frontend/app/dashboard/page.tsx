'use client'

/**
 * The system implements the main dashboard page.
 * This page is protected and requires authentication to access.
 */

import { ProtectedRoute } from '@/components/protected-route'
import { DashboardContent } from '@/components/dashboard-content'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
      <Toaster position="top-right" />
    </ProtectedRoute>
  )
}
