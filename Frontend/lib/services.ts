/**
 * The system provides API service functions for disability management.
 * These services connect to the actual backend API.
 */

import api from './api'
import { refreshEmitter } from '@/hooks/use-auto-refresh'
import type {
  AuthResponse,
  LoginCredentials,
  Disability,
  ExpirationAlert,
  DisabilityStatus,
  TraceabilityResponse,
} from './types'

/**
 * The system maps backend user response to frontend user type.
 */
const mapUserResponse = (response: any) => ({
  id: response.id,
  email: response.email,
  name: response.nombre_completo,
  role: response.rol as any,
})

/**
 * The system handles user authentication via POST /api/auth/login.
 */
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const form = new URLSearchParams()
    form.append('username', credentials.email)
    form.append('password', credentials.password)
    
    const response = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    const { access_token, token_type, user } = response.data
    const token = access_token
    
    return {
      token,
      user: {
        id: user.id,
        role: user.rol,
        email: user.email,
        name: user.nombre_completo,
      }
    }
  },
  
  register: async (data: { 
    name: string
    email: string
    document: string
    role: string
    password: string 
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/registrar', {
      nombre_completo: data.name,
      email: data.email,
      documento: data.document,
      rol: data.role,
      password: data.password
    })
    
    return {
      token: '',
      user: mapUserResponse(response.data)
    }
  },
  
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },
}

/**
 * The system handles disability CRUD operations via /api/incapacidades.
 */
export const disabilityService = {
  getAll: async (): Promise<Disability[]> => {
    const response = await api.get('/incapacidades')
    return response.data.map((item: any) => ({
      id: item.id,
      employeeId: item.colaborador_id,
      employeeName: item.colaborador_nombre,
      employeeDocument: item.colaborador_documento,
      startDate: item.fecha_inicio,
      endDate: item.fecha_fin,
      diagnosis: '',
      diagnosisCode: item.diagnostico_cie10 || '',
      eps: item.eps_nombre,
      totalDays: item.dias_otorgados,
      status: item.estado,
      createdAt: item.fecha_registro,
      updatedAt: '',
      expirationDate: '',
      daysUntilExpiration: 0,
      soportes: item.soportes?.map((s: any) => ({
        id: s.id,
        tipoDocumento: s.tipo_documento,
        urlArchivo: (() => {
          const raw = s.url_archivo || ''
          const apiRoot = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
          try {
            const parsed = new URL(raw)
            // If the URL points to the frontend origin (e.g., deployed on Vercel under same domain),
            // replace origin with API root so the file is served by backend
            if (typeof window !== 'undefined' && parsed.origin === window.location.origin) {
              return `${apiRoot}${parsed.pathname}${parsed.search}`
            }
            return raw
          } catch (e) {
            // raw is relative or invalid as absolute URL
            if (raw.startsWith('/')) return `${apiRoot}${raw}`
            return raw
          }
        })(),
      })) || []
    }))
  },
  
  getById: async (id: string): Promise<Disability> => {
    const response = await api.get(`/incapacidades/${id}`)
    const item = response.data
    return {
      id: item.id,
      employeeId: item.colaborador_id,
      employeeName: item.colaborador_nombre,
      employeeDocument: item.colaborador_documento,
      startDate: item.fecha_inicio,
      endDate: item.fecha_fin,
      diagnosis: '',
      diagnosisCode: item.diagnostico_cie10 || '',
      eps: item.eps_nombre,
      totalDays: item.dias_otorgados,
      status: item.estado,
      createdAt: item.fecha_registro,
      updatedAt: '',
      expirationDate: '',
      daysUntilExpiration: 0,
      soportes: item.soportes?.map((s: any) => ({
        id: s.id,
        tipoDocumento: s.tipo_documento,
        urlArchivo: (() => {
          const raw = s.url_archivo || ''
          const apiRoot = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
          if (raw.startsWith('/')) return `${apiRoot}${raw}`
          return raw
        })(),
      })) || []
    }
  },
  
  getTraceability: async (id: string): Promise<TraceabilityResponse> => {
    const response = await api.get(`/incapacidades/${id}/trazabilidad`)
    const data = response.data
    return {
      incapacidadId: data.incapacidad_id,
      estadoActual: data.estado_actual,
      timeline: (data.timeline || []).map((entry: any) => ({
        estado: entry.estado,
        fechaCambio: entry.fecha_cambio,
        alcanzado: entry.alcanzado,
        esActual: entry.es_actual,
      })),
      logs: (data.logs || []).map((entry: any) => ({
        estado: entry.estado,
        fechaCambio: entry.fecha_cambio,
      })),
    }
  },
  
  updateStatus: async (id: string, status: DisabilityStatus): Promise<Disability> => {
    const response = await api.patch(`/incapacidades/${id}/estado`, { estado: status })
    const item = response.data
    return {
      id: item.id,
      employeeId: item.colaborador_id,
      employeeName: '',
      employeeDocument: '',
      startDate: item.fecha_inicio,
      endDate: item.fecha_fin,
      diagnosis: '',
      diagnosisCode: item.diagnostico_cie10,
      eps: '',
      totalDays: item.dias_otorgados,
      status: item.estado,
      createdAt: item.fecha_registro,
      updatedAt: '',
      expirationDate: '',
      daysUntilExpiration: 0,
    }
  },
  
  create: async (data: {
    employeeDocument: string
    employeeName: string
    epsId: string
    startDate: string
    endDate: string
    totalDays: number
    diagnosis: string
    diagnosisCode: string
    soportes?: any[]
  }): Promise<Disability> => {
    const payload: any = {
      colaborador_documento: data.employeeDocument,
      eps_id: parseInt(data.epsId),
      fecha_inicio: data.startDate,
      fecha_fin: data.endDate,
      dias_otorgados: data.totalDays,
      diagnostico_cie10: data.diagnosisCode,
      soportes: data.soportes ?? [{ tipo_documento: 'CERTIFICADO' }]
    }

    const response = await api.post('/incapacidades', payload)
    const item = response.data
    
    // The system emits event to notify dashboard of new disability
    refreshEmitter.emit('disabilityCreated')
    
    return {
      id: item.id,
      employeeId: item.colaborador_id,
      employeeName: '',
      employeeDocument: '',
      startDate: item.fecha_inicio,
      endDate: item.fecha_fin,
      diagnosis: '',
      diagnosisCode: item.diagnostico_cie10,
      eps: '',
      totalDays: item.dias_otorgados,
      status: item.estado,
      createdAt: item.fecha_registro,
      updatedAt: '',
      expirationDate: '',
      daysUntilExpiration: 0,
    }
  },
}

/**
 * The system handles expiration alerts via /api/alertas/vencimientos.
 */
export const alertService = {
  getExpirationAlerts: async (): Promise<ExpirationAlert[]> => {
    const response = await api.get('/alertas/vencimientos')
    return (response.data || []).map((item: any) => ({
      id: item.id,
      disabilityId: item.disabilityId,
      employeeName: item.employeeName,
      daysUntilExpiration: item.daysUntilExpiration,
      expirationDate: item.expirationDate,
      status: item.status,
      alertLevel: item.alertLevel,
    }))
  },
}

/**
 * The system handles financial conciliation via /api/finanzas/conciliar.
 */
export const financeService = {
  conciliate: async (disabilityId: string, amountPaid: number): Promise<Disability> => {
    const response = await api.post('/finanzas/conciliar', {
      incapacidad_id: disabilityId,
      valor_pagado: amountPaid
    })
    const item = response.data?.incapacidad ?? response.data
    return {
      id: item.id,
      employeeId: item.colaborador_id,
      employeeName: '',
      employeeDocument: '',
      startDate: item.fecha_inicio,
      endDate: item.fecha_fin,
      diagnosis: '',
      diagnosisCode: item.diagnostico_cie10,
      eps: '',
      totalDays: item.dias_otorgados,
      status: item.estado,
      createdAt: item.fecha_registro,
      updatedAt: '',
      expirationDate: '',
      daysUntilExpiration: 0,
    }
  },
}

export const usuariosService = {
  getAll: async (): Promise<any[]> => {
    try {
      const response = await api.get('/usuarios')
      return response.data || []
    } catch (error) {
      console.error('Error fetching usuarios:', error)
      throw error
    }
  },
}

export { api }