/**
 * The system configures Axios for API communication.
 * This module handles all HTTP requests to the backend services.
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

/**
 * The system defines the base API URL for all requests.
 * In production, this would point to the actual backend server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * The system creates a configured Axios instance with interceptors.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * The system adds JWT token to all outgoing requests via interceptor.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

/**
 * The system handles response errors globally via interceptor.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // The system clears authentication on unauthorized response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/login'
      }
    }
    
    // The system extracts the error detail from backend response
    const errorDetail = error.response?.data?.detail || error.message || 'Error desconocido'
    const errorWithMessage = new Error(errorDetail)
    return Promise.reject(errorWithMessage)
  }
)

export default api
