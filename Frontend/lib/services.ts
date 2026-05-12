/**
 * The system provides API service functions for disability management.
 * These services simulate backend communication using mock data.
 */

import api from './api'
import { mockUsers, mockDisabilities, mockAlerts } from './mock-data'
import type {
  AuthResponse,
  LoginCredentials,
  Disability,
  ExpirationAlert,
  DisabilityStatus,
} from './types'

/**
 * The system simulates network delay for realistic UX testing.
 */
const simulateDelay = (ms: number = 800) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The system handles user authentication via POST /api/auth/login.
 * In production, this connects to the actual authentication endpoint.
 */
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await simulateDelay()
    
    // The system simulates authentication by checking mock users
    const user = mockUsers.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    )
    
    if (!user) {
      throw new Error('Credenciales inválidas. Verifique su email y contraseña.')
    }
    
    // The system generates a mock JWT token
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 86400000 }))
    
    // The system returns user data without password
    const { password: _, ...userData } = user
    
    return {
      token,
      user: userData,
    }
  },
  
  register: async (data: { 
    name: string
    email: string
    document: string
    role: string
    password: string 
  }): Promise<AuthResponse> => {
    await simulateDelay()
    
    // The system checks if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email)
    if (existingUser) {
      throw new Error('Ya existe un usuario con este correo electrónico.')
    }
    
    // The system creates a new user
    const newUser = {
      id: String(mockUsers.length + 1),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role as any,
      department: undefined,
    }
    
    mockUsers.push(newUser)
    
    // The system generates a mock JWT token
    const token = btoa(JSON.stringify({ userId: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }))
    
    const { password: _, ...userData } = newUser
    
    return {
      token,
      user: userData,
    }
  },
  
  logout: () => {
    // The system clears stored authentication data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },
}

/**
 * The system handles disability CRUD operations via /api/incapacidades.
 */
export const disabilityService = {
  /**
   * The system fetches all disabilities via GET /api/incapacidades/.
   */
  getAll: async (): Promise<Disability[]> => {
    await simulateDelay()
    // The system returns mock disabilities for simulation
    return [...mockDisabilities]
  },
  
  /**
   * The system fetches a single disability by ID.
   */
  getById: async (id: string): Promise<Disability | undefined> => {
    await simulateDelay(500)
    return mockDisabilities.find((d) => d.id === id)
  },
  
  /**
   * The system fetches traceability logs via GET /api/incapacidades/{id}/trazabilidad.
   */
  getTraceability: async (id: string): Promise<{ logs: any[] }> => {
    await simulateDelay(300)
    return {
      logs: [
        { evento: 'REGISTRADA', fecha: new Date().toISOString() },
        { evento: 'RADICADA', fecha: new Date().toISOString() },
      ]
    }
  },
  
  /**
   * The system updates disability status via PATCH /api/incapacidades/{id}/estado.
   */
  updateStatus: async (id: string, status: DisabilityStatus): Promise<Disability> => {
    await simulateDelay()
    
    const disability = mockDisabilities.find((d) => d.id === id)
    if (!disability) {
      throw new Error('Incapacidad no encontrada')
    }
    
    // The system simulates status update
    disability.status = status
    disability.updatedAt = new Date().toISOString().split('T')[0]
    
    return { ...disability }
  },
  
  /**
   * The system creates a new disability via POST /api/incapacidades/.
   */
  create: async (data: Omit<Disability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Disability> => {
    await simulateDelay()
    
    const newDisability: Disability = {
      ...data,
      id: `INC-${String(mockDisabilities.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    
    mockDisabilities.push(newDisability)
    return newDisability
  },
}

/**
 * The system handles expiration alerts via /api/alertas/vencimientos.
 */
export const alertService = {
  /**
   * The system fetches expiration alerts via GET /api/alertas/vencimientos.
   */
  getExpirationAlerts: async (): Promise<ExpirationAlert[]> => {
    await simulateDelay(600)
    return [...mockAlerts]
  },
}

/**
 * The system handles financial conciliation via /api/finanzas/conciliar.
 */
export const financeService = {
  /**
   * The system processes payment conciliation via POST /api/finanzas/conciliar.
   */
  conciliate: async (disabilityId: string, amountPaid: number): Promise<Disability> => {
    await simulateDelay()
    
    const disability = mockDisabilities.find((d) => d.id === disabilityId)
    if (!disability) {
      throw new Error('Incapacidad no encontrada')
    }
    
    // The system updates status to PAGADA after conciliation
    disability.status = 'PAGADA'
    disability.updatedAt = new Date().toISOString().split('T')[0]
    
    return { ...disability }
  },
}

export { api }
