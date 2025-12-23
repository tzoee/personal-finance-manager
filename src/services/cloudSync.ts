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
        console.log('[CloudSync] Save failed: User not authenticated')
        return { success: false, error: 'User not authenticated' }
      }

      // Export all local data
      const appData = await storageService.exportAllData()
      console.log('[CloudSync] Saving data for user:', user.id)
      console.log('[CloudSync] Data summary:', {
        transactions: appData.transactions?.length || 0,
        categories: appData.categories?.length || 0,
        wishlist: appData.wishlist?.length || 0,
        installments: appData.installments?.length || 0,
        monthlyNeeds: appData.monthlyNeeds?.length || 0,
        assets: appData.assets?.length || 0,
      })

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
        console.error('[CloudSync] Save error:', error)
        return { success: false, error: error.message }
      }

      // Save last sync time to localStorage
      localStorage.setItem('pfm_last_synced', new Date().toISOString())
      console.log('[CloudSync] Save successful')
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[CloudSync] Save error:', message)
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
        console.log('[CloudSync] Load failed: User not authenticated')
        return { success: false, error: 'User not authenticated' }
      }

      console.log('[CloudSync] Loading data for user:', user.id)

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('user_data')
        .select('data, updated_at')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is okay for new users
          console.log('[CloudSync] No cloud data found for user')
          return { success: true, hasData: false }
        }
        console.error('[CloudSync] Load error:', error)
        return { success: false, error: error.message }
      }

      if (!data?.data) {
        console.log('[CloudSync] Cloud data is empty')
        return { success: true, hasData: false }
      }

      const cloudData = data.data as AppData
      console.log('[CloudSync] Cloud data summary:', {
        transactions: cloudData.transactions?.length || 0,
        categories: cloudData.categories?.length || 0,
        wishlist: cloudData.wishlist?.length || 0,
        installments: cloudData.installments?.length || 0,
        monthlyNeeds: cloudData.monthlyNeeds?.length || 0,
        assets: cloudData.assets?.length || 0,
      })

      // Import data to local storage (replace mode)
      await storageService.importData(cloudData, 'replace')
      
      // Save last sync time
      localStorage.setItem('pfm_last_synced', data.updated_at || new Date().toISOString())
      console.log('[CloudSync] Load successful')

      return { success: true, hasData: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[CloudSync] Load error:', message)
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
