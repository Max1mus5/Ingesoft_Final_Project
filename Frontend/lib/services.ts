/**
 * The system provides API service functions for disability management.
 * These services connect to the actual backend API.
 */

import api from './api'
import type {
  AuthResponse,
  LoginCredentials,
  Disability,
  ExpirationAlert,
  DisabilityStatus,
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
    }))
  },
  
  getById: async (id: string): Promise<Disability> => {
    const response = await api.get(`/incapacidades/${id}`)
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
  
  getTraceability: async (id: string): Promise<{ logs: any[] }> => {
    const response = await api.get(`/incapacidades/${id}/trazabilidad`)
    return response.data
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
  }): Promise<Disability> => {
    const response = await api.post('/incapacidades', {
      colaborador_documento: data.employeeDocument,
      eps_id: parseInt(data.epsId),
      fecha_inicio: data.startDate,
      fecha_fin: data.endDate,
      dias_otorgados: data.totalDays,
      diagnostico_cie10: data.diagnosisCode,
      soportes: [{ tipo_documento: 'CERTIFICADO' }]
    })
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
}

/**
 * The system handles expiration alerts via /api/alertas/vencimientos.
 */
export const alertService = {
  getExpirationAlerts: async (): Promise<ExpirationAlert[]> => {
    const response = await api.get('/alertas/vencimientos')
    return response.data
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
}

export { api }