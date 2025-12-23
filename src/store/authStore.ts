/**
 * Auth Store - Supabase Authentication State Management
 */

import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  initialized: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  clearError: () => void
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error

      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        })
      })
    } catch (error) {
      set({
        loading: false,
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
      })
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const errorMessage = getErrorMessage(error.message)
        set({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login gagal'
      set({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        const errorMessage = getErrorMessage(error.message)
        set({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registrasi gagal'
      set({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  signOut: async () => {
    set({ loading: true })
    
    try {
      await supabase.auth.signOut()
      set({
        user: null,
        session: null,
        loading: false,
        error: null,
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Logout gagal',
      })
    }
  },

  clearError: () => set({ error: null }),
}))

// Helper function to translate error messages
function getErrorMessage(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email atau password salah',
    'Email not confirmed': 'Silakan verifikasi email Anda terlebih dahulu',
    'User already registered': 'Email sudah terdaftar',
    'Password should be at least 6 characters': 'Password minimal 6 karakter',
    'Unable to validate email address: invalid format': 'Format email tidak valid',
  }
  
  return errorMap[message] || message
}
