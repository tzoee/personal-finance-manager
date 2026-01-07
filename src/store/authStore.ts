/**
 * Auth Store
 * Manages user authentication with Supabase
 */

import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { cloudSyncService } from '../services/cloudSync'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  clearError: () => void
  // Aliases for existing pages
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      set({
        user: session?.user ?? null,
        session,
        initialized: true,
      })

      // If user is logged in, check if we should sync from cloud
      if (session?.user) {
        const hasLocalData = localStorage.getItem('pfm_transactions') !== null
        
        // If no local data but user is logged in, sync from cloud
        if (!hasLocalData) {
          console.log('[Auth] No local data found, syncing from cloud...')
          const syncResult = await cloudSyncService.loadFromCloud()
          if (syncResult.success && syncResult.hasData) {
            console.log('[Auth] Cloud data loaded on init')
            // Don't reload here, let the app load naturally
          }
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session,
        })
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ initialized: true, error: 'Gagal menginisialisasi auth' })
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mendaftar'
      set({ loading: false, error: message })
      return { success: false, error: message }
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })

      // Auto-sync from cloud after login
      console.log('[Auth] Login successful, syncing from cloud...')
      const syncResult = await cloudSyncService.loadFromCloud()
      if (syncResult.success && syncResult.hasData) {
        console.log('[Auth] Cloud data loaded, refreshing page...')
        // Refresh page to load new data into stores
        setTimeout(() => window.location.reload(), 500)
      }

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal masuk'
      set({ loading: false, error: message })
      return { success: false, error: message }
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
      })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null }),
  
  // Aliases for existing pages
  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })

      // Auto-sync from cloud after login
      console.log('[Auth] Login successful, syncing from cloud...')
      const syncResult = await cloudSyncService.loadFromCloud()
      if (syncResult.success && syncResult.hasData) {
        console.log('[Auth] Cloud data loaded, refreshing page...')
        // Refresh page to load new data into stores
        setTimeout(() => window.location.reload(), 500)
      }

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal masuk'
      set({ loading: false, error: message })
      return { success: false, error: message }
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
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
      })

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mendaftar'
      set({ loading: false, error: message })
      return { success: false, error: message }
    }
  },
}))
