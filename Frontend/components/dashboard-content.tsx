'use client'

/**
 * The system implements the main dashboard content component.
 * This component orchestrates the disability table and alerts panel.
 */

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Plus, FileBarChart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from './dashboard-header'
import { DisabilityTable } from './disability-table'
import { AlertsPanel } from './alerts-panel'
import { disabilityService, alertService } from '@/lib/services'
import { useAuthStore } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import { useAutoRefresh, useRefreshEvent } from '@/hooks/use-auto-refresh'
import type { Disability, ExpirationAlert, DisabilityStatus } from '@/lib/types'

export function DashboardContent() {
   const { user } = useAuthStore()
   const router = useRouter()
  const [disabilities, setDisabilities] = useState<Disability[]>([])
  const [alerts, setAlerts] = useState<ExpirationAlert[]>([])
  const [isLoadingDisabilities, setIsLoadingDisabilities] = useState(true)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  /**
   * The system fetches disabilities and alerts from the API.
   */
  const fetchData = useCallback(async () => {
    try {
      // The system fetches disabilities via GET /api/incapacidades/
      const disabilitiesData = await disabilityService.getAll()
      setDisabilities(disabilitiesData)
      setIsLoadingDisabilities(false)
      
      // The system fetches alerts via GET /api/alertas/vencimientos
      const alertsData = await alertService.getExpirationAlerts()
      setAlerts(alertsData)
      setIsLoadingAlerts(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Error al cargar los datos')
      setIsLoadingDisabilities(false)
      setIsLoadingAlerts(false)
    }
  }, [])
  
  /**
   * The system sets up auto-refresh and event listeners for real-time updates.
   */
  useAutoRefresh(fetchData, 30000, true)
  
  /**
   * The system listens for disability creation events and refreshes.
   */
  useRefreshEvent('disabilityCreated', fetchData)
  
  /**
   * The system handles manual data refresh.
   */
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchData()
      toast.success('Datos actualizados')
    } catch (error) {
      toast.error('Error al actualizar los datos')
    } finally {
      setIsRefreshing(false)
    }
  }
  
  /**
   * The system handles disability status changes via PATCH /api/incapacidades/{id}/estado.
   */
  const handleStatusChange = async (id: string, newStatus: DisabilityStatus) => {
    try {
      await disabilityService.updateStatus(id, newStatus)
      
      // The system updates local state to reflect the change
      setDisabilities((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
      )
      
      toast.success(`Estado actualizado a ${newStatus}`)
    } catch (error) {
      toast.error('Error al actualizar el estado')
    }
  }
  
  /**
   * The system calculates summary statistics for the dashboard.
   */
  const stats = {
    total: disabilities.length,
    radicadas: disabilities.filter((d) => d.status === 'RADICADA').length,
    enMora: disabilities.filter((d) => d.status === 'EN_MORA').length,
    pagadas: disabilities.filter((d) => d.status === 'PAGADA').length,
  }
  
  return (
    <div className="min-h-screen bg-[#121212]">
      <DashboardHeader alertCount={alerts.length} />
      
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* The system renders dashboard header with actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#E0E0E0]">Dashboard</h1>
            <p className="mt-1 text-sm text-[#9E9E9E]">
              Gestión integral de incapacidades y recobros
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-[#2A2A2A] bg-transparent text-[#E0E0E0] hover:bg-[#2A2A2A]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
{(user?.role === 'GESTION_HUMANA' || user?.role === 'ADMIN') && (
  <Button
    className="bg-[#00E5FF] text-[#121212] hover:bg-[#00E5FF]/90"
    onClick={() => router.push('/incapacidades/nueva')}
  >
    <Plus className="mr-2 h-4 w-4" />
    Nueva incapacidad
  </Button>
)}
          </div>
        </div>
        
        {/* The system renders summary statistics cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            color="#00E5FF"
            isLoading={isLoadingDisabilities}
          />
          <StatCard
            label="Radicadas"
            value={stats.radicadas}
            color="#00E5FF"
            isLoading={isLoadingDisabilities}
          />
          <StatCard
            label="En Mora"
            value={stats.enMora}
            color="#FF5252"
            isLoading={isLoadingDisabilities}
          />
          <StatCard
            label="Pagadas"
            value={stats.pagadas}
            color="#00E676"
            isLoading={isLoadingDisabilities}
          />
        </div>
        
        {/* The system renders main content grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* The system renders the disability table in the main area */}
          <div className="lg:col-span-3">
            <DisabilityTable
              disabilities={disabilities}
              userRole={user?.role || 'COLABORADOR'}
              onStatusChange={handleStatusChange}
              isLoading={isLoadingDisabilities}
            />
          </div>
          
          {/* The system renders the alerts panel in the sidebar */}
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} isLoading={isLoadingAlerts} />
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * The system renders a statistic card component.
 */
function StatCard({
  label,
  value,
  color,
  isLoading,
}: {
  label: string
  value: number
  color: string
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-16 rounded bg-[#2A2A2A]" />
          <div className="h-8 w-12 rounded bg-[#2A2A2A]" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] p-4">
      <p className="text-xs font-medium text-[#9E9E9E]">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
