/**
 * The system implements authentication state management using Zustand.
 * This store handles user session persistence and role-based access.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from './types'

/**
 * The system defines the authentication store interface.
 */
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

/**
 * The system creates a persisted authentication store.
 * The store automatically syncs with localStorage for session persistence.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      /**
       * The system sets authentication data after successful login.
       */
      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
        // The system also stores token in localStorage for API interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }
      },
      
      /**
       * The system clears authentication data on logout.
       */
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
        // The system removes token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
      },
      
      /**
       * The system sets loading state during authentication operations.
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
