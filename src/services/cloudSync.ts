/**
 * Cloud Sync Service - Sync data with Supabase
 */

import { supabase } from '../lib/supabase'
import { storageService } from './storage'
import type { AppData } from '../types'

export interface SyncStatus {
  lastSynced: string | null
  isSyncing: boolean
  error: string | null
}

/**
 * Cloud sync service for syncing data with Supabase
 */
export const cloudSyncService = {
  /**
   * Save all local data to cloud
   */
  async saveToCloud(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Export all local data
      const appData = await storageService.exportAllData()

      // Upsert to Supabase
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          data: appData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Cloud save error:', error)
        return { success: false, error: error.message }
      }

      // Save last sync time to localStorage
      localStorage.setItem('pfm_last_synced', new Date().toISOString())
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Cloud save error:', message)
      return { success: false, error: message }
    }
  },

  /**
   * Load data from cloud and replace local data
   */
  async loadFromCloud(): Promise<{ success: boolean; error?: string; hasData?: boolean }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is okay for new users
          return { success: true, hasData: false }
        }
        console.error('Cloud load error:', error)
        return { success: false, error: error.message }
      }

      if (!data?.data) {
        return { success: true, hasData: false }
      }

      // Import data to local storage (replace mode)
      await storageService.importData(data.data as AppData, 'replace')
      
      // Save last sync time
      localStorage.setItem('pfm_last_synced', data.updated_at || new Date().toISOString())

      return { success: true, hasData: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Cloud load error:', message)
      return { success: false, error: message }
    }
  },

  /**
   * Check if cloud has data for current user
   */
  async hasCloudData(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', user.id)
        .single()

      return !error && !!data
    } catch {
      return false
    }
  },

  /**
   * Get last sync time
   */
  getLastSyncTime(): string | null {
    return localStorage.getItem('pfm_last_synced')
  },

  /**
   * Delete cloud data for current user
   */
  async deleteCloudData(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      localStorage.removeItem('pfm_last_synced')
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message }
    }
  },
}

export default cloudSyncService
