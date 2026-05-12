/**
 * The system defines TypeScript types for the disability management application.
 * These types ensure type safety across all components and services.
 */

/**
 * The system defines user roles as per the technical specification.
 */
export type UserRole = 'ADMIN' | 'GESTION_HUMANA' | 'CONTABILIDAD' | 'COLABORADOR'

/**
 * The system defines disability status values for tracking.
 */
export type DisabilityStatus = 'RADICADA' | 'EN_MORA' | 'APROBADA' | 'PAGADA' | 'RECHAZADA'

/**
 * The system defines the user data structure returned by authentication.
 */
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
}

/**
 * The system defines the authentication response structure.
 */
export interface AuthResponse {
  token: string
  user: User
}

/**
 * The system defines login credentials structure.
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * The system defines the disability record structure.
 */
export interface Disability {
  id: string
  employeeId: string
  employeeName: string
  employeeDocument: string
  startDate: string
  endDate: string
  diagnosis: string
  diagnosisCode: string
  eps: string
  totalDays: number
  status: DisabilityStatus
  documentUrl?: string
  createdAt: string
  updatedAt: string
  expirationDate: string
  daysUntilExpiration: number
}

/**
 * The system defines the alert structure for expiration warnings.
 */
export interface ExpirationAlert {
  id: string
  disabilityId: string
  employeeName: string
  daysUntilExpiration: number
  expirationDate: string
  status: DisabilityStatus
  alertLevel: 'WARNING' | 'CRITICAL' | 'EXPIRED'
}

/**
 * The system defines the financial conciliation payload.
 */
export interface ConciliationPayload {
  disabilityId: string
  amountPaid: number
  paymentDate: string
  transactionReference?: string
}

/**
 * The system defines the API response wrapper structure.
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}
