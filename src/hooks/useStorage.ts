import { useCallback } from 'react'
import type { AppData } from '../types'
import { useCategoryStore } from '../store/categoryStore'
import { useTransactionStore } from '../store/transactionStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useInstallmentStore } from '../store/installmentStore'
import { useMonthlyNeedStore } from '../store/monthlyNeedStore'
import { useAssetStore } from '../store/assetStore'
import { useSettingsStore } from '../store/settingsStore'
import { CURRENT_SCHEMA_VERSION } from '../constants/defaults'
import { migrateData, validateImportData, needsMigration } from '../services/migration'

export function useStorage() {
  const { categories } = useCategoryStore()
  const { transactions } = useTransactionStore()
  const { items: wishlist } = useWishlistStore()
  const { installments } = useInstallmentStore()
  const { needs: monthlyNeeds, payments: monthlyNeedPayments } = useMonthlyNeedStore()
  const { assets } = useAssetStore()
  const { settings } = useSettingsStore()

  /**
   * Export all data to JSON string
   */
  const exportData = useCallback((): string => {
    const data: AppData = {
      version: CURRENT_SCHEMA_VERSION,
      settings,
      transactions,
      categories,
      wishlist,
      installments,
      monthlyNeeds,
      monthlyNeedPayments,
      assets,
      exportedAt: new Date().toISOString(),
    }

    return JSON.stringify(data, null, 2)
  }, [settings, transactions, categories, wishlist, installments, monthlyNeeds, monthlyNeedPayments, assets])

  /**
   * Download exported data as JSON file
   */
  const downloadExport = useCallback(() => {
    const jsonString = exportData()
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const date = new Date().toISOString().split('T')[0]
    const filename = `finance-backup-${date}.json`
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [exportData])

  /**
   * Import data from JSON string
   */
  const importData = useCallback(async (
    jsonString: string,
    mode: 'merge' | 'replace'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Parse JSON
      let data: AppData
      try {
        data = JSON.parse(jsonString)
      } catch {
        return { success: false, message: 'File JSON tidak valid' }
      }

      // Validate structure
      const validation = validateImportData(data)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Migrate if needed
      if (needsMigration(data)) {
        data = migrateData(data)
      }

      // Import based on mode
      if (mode === 'replace') {
        // Clear all existing data
        localStorage.clear()
      }

      // Import settings
      if (data.settings) {
        const existingSettings = JSON.parse(localStorage.getItem('pfm_settings') || '{}')
        const newSettings = mode === 'replace' ? data.settings : { ...existingSettings, ...data.settings }
        localStorage.setItem('pfm_settings', JSON.stringify(newSettings))
      }

      // Import categories
      if (data.categories?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_categories', JSON.stringify(data.categories))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_categories') || '[]')
          const existingIds = new Set(existing.map((c: { id: string }) => c.id))
          const newCategories = data.categories.filter(c => !existingIds.has(c.id))
          localStorage.setItem('pfm_categories', JSON.stringify([...existing, ...newCategories]))
        }
      }

      // Import transactions
      if (data.transactions?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_transactions', JSON.stringify(data.transactions))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_transactions') || '[]')
          const existingIds = new Set(existing.map((t: { id: string }) => t.id))
          const newTransactions = data.transactions.filter(t => !existingIds.has(t.id))
          localStorage.setItem('pfm_transactions', JSON.stringify([...existing, ...newTransactions]))
        }
      }

      // Import wishlist
      if (data.wishlist?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_wishlist', JSON.stringify(data.wishlist))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_wishlist') || '[]')
          const existingIds = new Set(existing.map((w: { id: string }) => w.id))
          const newItems = data.wishlist.filter(w => !existingIds.has(w.id))
          localStorage.setItem('pfm_wishlist', JSON.stringify([...existing, ...newItems]))
        }
      }

      // Import installments
      if (data.installments?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_installments', JSON.stringify(data.installments))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_installments') || '[]')
          const existingIds = new Set(existing.map((i: { id: string }) => i.id))
          const newInstallments = data.installments.filter(i => !existingIds.has(i.id))
          localStorage.setItem('pfm_installments', JSON.stringify([...existing, ...newInstallments]))
        }
      }

      // Import monthly needs
      if (data.monthlyNeeds?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_monthly_needs', JSON.stringify(data.monthlyNeeds))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_monthly_needs') || '[]')
          const existingIds = new Set(existing.map((n: { id: string }) => n.id))
          const newNeeds = data.monthlyNeeds.filter(n => !existingIds.has(n.id))
          localStorage.setItem('pfm_monthly_needs', JSON.stringify([...existing, ...newNeeds]))
        }
      }

      // Import monthly need payments
      if (data.monthlyNeedPayments?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_monthly_need_payments', JSON.stringify(data.monthlyNeedPayments))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_monthly_need_payments') || '[]')
          const existingIds = new Set(existing.map((p: { id: string }) => p.id))
          const newPayments = data.monthlyNeedPayments.filter(p => !existingIds.has(p.id))
          localStorage.setItem('pfm_monthly_need_payments', JSON.stringify([...existing, ...newPayments]))
        }
      }

      // Import assets
      if (data.assets?.length) {
        if (mode === 'replace') {
          localStorage.setItem('pfm_assets', JSON.stringify(data.assets))
        } else {
          const existing = JSON.parse(localStorage.getItem('pfm_assets') || '[]')
          const existingIds = new Set(existing.map((a: { id: string }) => a.id))
          const newAssets = data.assets.filter(a => !existingIds.has(a.id))
          localStorage.setItem('pfm_assets', JSON.stringify([...existing, ...newAssets]))
        }
      }

      // Reload page to refresh all stores
      window.location.reload()

      return { success: true, message: 'Data berhasil diimport' }
    } catch (error) {
      console.error('Import error:', error)
      return { success: false, message: 'Terjadi kesalahan saat import data' }
    }
  }, [])

  /**
   * Reset all data
   */
  const resetData = useCallback(async (): Promise<void> => {
    // Clear all localStorage keys related to the app
    const keysToRemove = [
      'pfm_settings',
      'pfm_categories',
      'pfm_transactions',
      'pfm_wishlist',
      'pfm_installments',
      'pfm_monthly_needs',
      'pfm_monthly_need_payments',
      'pfm_assets',
    ]

    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Reload to reinitialize with defaults
    window.location.reload()
  }, [])

  /**
   * Get storage info
   */
  const getStorageInfo = useCallback(() => {
    const totalRecords = 
      transactions.length +
      categories.length +
      wishlist.length +
      installments.length +
      monthlyNeeds.length +
      monthlyNeedPayments.length +
      assets.length

    // Estimate storage size
    let storageUsed = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('pfm_')) {
        const value = localStorage.getItem(key)
        if (value) {
          storageUsed += key.length + value.length
        }
      }
    }

    return {
      totalRecords,
      storageUsed: storageUsed * 2, // UTF-16 encoding
      tables: {
        transactions: transactions.length,
        categories: categories.length,
        wishlist: wishlist.length,
        installments: installments.length,
        monthlyNeeds: monthlyNeeds.length,
        monthlyNeedPayments: monthlyNeedPayments.length,
        assets: assets.length,
      },
    }
  }, [transactions, categories, wishlist, installments, monthlyNeeds, monthlyNeedPayments, assets])

  return {
    exportData,
    downloadExport,
    importData,
    resetData,
    getStorageInfo,
  }
}
