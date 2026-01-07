/**
 * Sync Service
 * Handles data synchronization between localStorage and Supabase
 */

import { supabase } from '../lib/supabase'

export type DataType = 
  | 'transactions' 
  | 'categories' 
  | 'assets' 
  | 'installments' 
  | 'savings' 
  | 'wishlist' 
  | 'monthly_needs' 
  | 'settings'
  | 'gamification'

const LOCAL_STORAGE_KEYS: Record<DataType, string> = {
  transactions: 'pfm_transactions',
  categories: 'pfm_categories',
  assets: 'pfm_assets',
  installments: 'pfm_installments',
  savings: 'pfm_savings',
  wishlist: 'pfm_wishlist',
  monthly_needs: 'pfm_monthly_needs',
  settings: 'pfm_settings',
  gamification: 'pfm_gamification',
}

/**
 * Get data from Supabase for a specific type
 */
export async function getCloudData<T>(userId: string, dataType: DataType): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('data_type', dataType)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null
      }
      throw error
    }

    return data?.data as T
  } catch (error) {
    console.error(`Error fetching ${dataType} from cloud:`, error)
    return null
  }
}

/**
 * Save data to Supabase
 */
export async function saveToCloud<T>(userId: string, dataType: DataType, data: T): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        data_type: dataType,
        data: data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,data_type',
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Error saving ${dataType} to cloud:`, error)
    return false
  }
}

/**
 * Get data from localStorage
 */
export function getLocalData<T>(dataType: DataType): T | null {
  try {
    const key = LOCAL_STORAGE_KEYS[dataType]
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Save data to localStorage
 */
export function saveToLocal<T>(dataType: DataType, data: T): void {
  const key = LOCAL_STORAGE_KEYS[dataType]
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Sync all data from localStorage to cloud
 */
export async function syncLocalToCloud(userId: string): Promise<{ success: boolean; synced: DataType[] }> {
  const synced: DataType[] = []
  const dataTypes: DataType[] = [
    'transactions',
    'categories', 
    'assets',
    'installments',
    'savings',
    'wishlist',
    'monthly_needs',
    'settings',
    'gamification',
  ]

  for (const dataType of dataTypes) {
    const localData = getLocalData(dataType)
    if (localData !== null) {
      const success = await saveToCloud(userId, dataType, localData)
      if (success) {
        synced.push(dataType)
      }
    }
  }

  return { success: synced.length > 0, synced }
}

/**
 * Sync all data from cloud to localStorage
 */
export async function syncCloudToLocal(userId: string): Promise<{ success: boolean; synced: DataType[] }> {
  const synced: DataType[] = []
  const dataTypes: DataType[] = [
    'transactions',
    'categories',
    'assets',
    'installments',
    'savings',
    'wishlist',
    'monthly_needs',
    'settings',
    'gamification',
  ]

  for (const dataType of dataTypes) {
    const cloudData = await getCloudData(userId, dataType)
    if (cloudData !== null) {
      saveToLocal(dataType, cloudData)
      synced.push(dataType)
    }
  }

  return { success: synced.length > 0, synced }
}

/**
 * Get last sync timestamp from cloud
 */
export async function getLastSyncTime(userId: string): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return new Date(data.updated_at)
  } catch {
    return null
  }
}
