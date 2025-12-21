/**
 * useCategories Hook
 * Provides category management functionality with transaction awareness
 */

import { useCallback, useMemo } from 'react'
import { useCategoryStore } from '../store/categoryStore'
import { useTransactionStore } from '../store/transactionStore'
import type { Category, CategoryInput, Subcategory } from '../types'

export function useCategories() {
  const {
    categories,
    initialized,
    initialize,
    addCategory: storeAddCategory,
    updateCategory: storeUpdateCategory,
    deleteCategory: storeDeleteCategory,
    addSubcategory: storeAddSubcategory,
    deleteSubcategory: storeDeleteSubcategory,
    getCategoryById,
    getCategoriesByType,
  } = useCategoryStore()

  const { transactions } = useTransactionStore()

  /**
   * Get count of transactions using a specific category
   */
  const getCategoryTransactionCount = useCallback((categoryId: string): number => {
    return transactions.filter(tx => tx.categoryId === categoryId).length
  }, [transactions])

  /**
   * Get count of transactions using a specific subcategory
   */
  const getSubcategoryTransactionCount = useCallback((subcategoryId: string): number => {
    return transactions.filter(tx => tx.subcategoryId === subcategoryId).length
  }, [transactions])

  /**
   * Check if category can be safely deleted (no transactions)
   */
  const canDeleteCategory = useCallback((categoryId: string): boolean => {
    return getCategoryTransactionCount(categoryId) === 0
  }, [getCategoryTransactionCount])

  /**
   * Check if subcategory can be safely deleted (no transactions)
   */
  const canDeleteSubcategory = useCallback((subcategoryId: string): boolean => {
    return getSubcategoryTransactionCount(subcategoryId) === 0
  }, [getSubcategoryTransactionCount])

  /**
   * Add a new category
   */
  const addCategory = useCallback(async (input: CategoryInput): Promise<Category> => {
    return storeAddCategory(input)
  }, [storeAddCategory])

  /**
   * Update category (rename)
   */
  const updateCategory = useCallback(async (
    id: string,
    input: Partial<CategoryInput>
  ): Promise<void> => {
    await storeUpdateCategory(id, input)
  }, [storeUpdateCategory])

  /**
   * Delete category with optional migration
   */
  const deleteCategory = useCallback(async (
    id: string,
    migrateToId?: string
  ): Promise<{ success: boolean; message: string }> => {
    const transactionCount = getCategoryTransactionCount(id)

    if (transactionCount > 0 && !migrateToId) {
      return {
        success: false,
        message: `Kategori memiliki ${transactionCount} transaksi. Pilih kategori tujuan untuk migrasi.`,
      }
    }

    // Migrate transactions if needed
    if (transactionCount > 0 && migrateToId) {
      const stored = localStorage.getItem('pfm_transactions')
      if (stored) {
        const txs = JSON.parse(stored)
        const migrated = txs.map((tx: { categoryId: string; subcategoryId?: string }) => {
          if (tx.categoryId === id) {
            return { ...tx, categoryId: migrateToId, subcategoryId: undefined }
          }
          return tx
        })
        localStorage.setItem('pfm_transactions', JSON.stringify(migrated))
      }
    }

    await storeDeleteCategory(id)
    return { success: true, message: 'Kategori berhasil dihapus' }
  }, [getCategoryTransactionCount, storeDeleteCategory])

  /**
   * Add subcategory to a category
   */
  const addSubcategory = useCallback(async (
    parentId: string,
    name: string
  ): Promise<Subcategory> => {
    return storeAddSubcategory(parentId, name)
  }, [storeAddSubcategory])

  /**
   * Delete subcategory with optional migration
   */
  const deleteSubcategory = useCallback(async (
    parentId: string,
    subcategoryId: string,
    migrateToId?: string
  ): Promise<{ success: boolean; message: string }> => {
    const transactionCount = getSubcategoryTransactionCount(subcategoryId)

    if (transactionCount > 0 && !migrateToId) {
      return {
        success: false,
        message: `Subkategori memiliki ${transactionCount} transaksi. Pilih subkategori tujuan untuk migrasi atau hapus tanpa migrasi.`,
      }
    }

    // Migrate transactions if needed
    if (transactionCount > 0 && migrateToId) {
      const stored = localStorage.getItem('pfm_transactions')
      if (stored) {
        const txs = JSON.parse(stored)
        const migrated = txs.map((tx: { subcategoryId?: string }) => {
          if (tx.subcategoryId === subcategoryId) {
            return { ...tx, subcategoryId: migrateToId }
          }
          return tx
        })
        localStorage.setItem('pfm_transactions', JSON.stringify(migrated))
      }
    } else if (transactionCount > 0) {
      // Remove subcategory reference from transactions
      const stored = localStorage.getItem('pfm_transactions')
      if (stored) {
        const txs = JSON.parse(stored)
        const updated = txs.map((tx: { subcategoryId?: string }) => {
          if (tx.subcategoryId === subcategoryId) {
            return { ...tx, subcategoryId: undefined }
          }
          return tx
        })
        localStorage.setItem('pfm_transactions', JSON.stringify(updated))
      }
    }

    await storeDeleteSubcategory(parentId, subcategoryId)
    return { success: true, message: 'Subkategori berhasil dihapus' }
  }, [getSubcategoryTransactionCount, storeDeleteSubcategory])

  /**
   * Get category with transaction count
   */
  const getCategoryWithCount = useCallback((id: string) => {
    const category = getCategoryById(id)
    if (!category) return null

    return {
      ...category,
      transactionCount: getCategoryTransactionCount(id),
      subcategories: category.subcategories.map(sub => ({
        ...sub,
        transactionCount: getSubcategoryTransactionCount(sub.id),
      })),
    }
  }, [getCategoryById, getCategoryTransactionCount, getSubcategoryTransactionCount])

  /**
   * Get all categories with transaction counts
   */
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      transactionCount: getCategoryTransactionCount(cat.id),
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        transactionCount: getSubcategoryTransactionCount(sub.id),
      })),
    }))
  }, [categories, getCategoryTransactionCount, getSubcategoryTransactionCount])

  /**
   * Get income categories
   */
  const incomeCategories = useMemo(() => {
    return getCategoriesByType('income')
  }, [getCategoriesByType])

  /**
   * Get expense categories
   */
  const expenseCategories = useMemo(() => {
    return getCategoriesByType('expense')
  }, [getCategoriesByType])

  /**
   * Get asset categories
   */
  const assetCategories = useMemo(() => {
    return getCategoriesByType('asset')
  }, [getCategoriesByType])

  /**
   * Check if category name already exists
   */
  const categoryNameExists = useCallback((name: string, excludeId?: string): boolean => {
    const normalizedName = name.trim().toLowerCase()
    return categories.some(
      cat => cat.name.toLowerCase() === normalizedName && cat.id !== excludeId
    )
  }, [categories])

  return {
    // State
    categories,
    categoriesWithCounts,
    incomeCategories,
    expenseCategories,
    assetCategories,
    initialized,

    // Actions
    initialize,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,

    // Queries
    getCategoryById,
    getCategoriesByType,
    getCategoryWithCount,
    getCategoryTransactionCount,
    getSubcategoryTransactionCount,
    canDeleteCategory,
    canDeleteSubcategory,
    categoryNameExists,
  }
}
