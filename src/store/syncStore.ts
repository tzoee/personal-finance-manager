/**
 * Sync Store - Cloud sync state management
 */

import { create } from 'zustand'
import { cloudSyncService } from '../services/cloudSync'

interface SyncState {
  isSyncing: boolean
  lastSynced: string | null
  error: string | null
  autoSyncEnabled: boolean
}

interface SyncActions {
  saveToCloud: () => Promise<boolean>
  loadFromCloud: () => Promise<{ success: boolean; hasData?: boolean }>
  setAutoSync: (enabled: boolean) => void
  clearError: () => void
  initialize: () => void
}

export const useSyncStore = create<SyncState & SyncActions>((set, get) => ({
  isSyncing: false,
  lastSynced: null,
  error: null,
  autoSyncEnabled: true,

  initialize: () => {
    const lastSynced = cloudSyncService.getLastSyncTime()
    const autoSync = localStorage.getItem('pfm_auto_sync') !== 'false'
    set({ lastSynced, autoSyncEnabled: autoSync })
  },

  saveToCloud: async () => {
    set({ isSyncing: true, error: null })
    
    const result = await cloudSyncService.saveToCloud()
    
    if (result.success) {
      set({ 
        isSyncing: false, 
        lastSynced: new Date().toISOString(),
        error: null 
      })
    } else {
      set({ 
        isSyncing: false, 
        error: result.error || 'Gagal menyimpan ke cloud' 
      })
    }
    
    return result.success
  },

  loadFromCloud: async () => {
    set({ isSyncing: true, error: null })
    
    const result = await cloudSyncService.loadFromCloud()
    
    if (result.success) {
      set({ 
        isSyncing: false, 
        lastSynced: cloudSyncService.getLastSyncTime(),
        error: null 
      })
    } else {
      set({ 
        isSyncing: false, 
        error: result.error || 'Gagal memuat dari cloud' 
      })
    }
    
    return { success: result.success, hasData: result.hasData }
  },

  setAutoSync: (enabled: boolean) => {
    localStorage.setItem('pfm_auto_sync', String(enabled))
    set({ autoSyncEnabled: enabled })
  },

  clearError: () => set({ error: null }),
}))
