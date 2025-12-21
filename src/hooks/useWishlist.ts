/**
 * useWishlist Hook
 * Provides wishlist management with progress calculations, filtering, and sorting
 */

import { useCallback, useMemo, useState } from 'react'
import { useWishlistStore } from '../store/wishlistStore'
import { useTransactionStore } from '../store/transactionStore'
import { validateWishlistItem } from '../utils/validators'
import type { WishlistItem, WishlistInput, TransactionInput, Priority } from '../types'

export interface WishlistItemWithProgress extends WishlistItem {
  progress: number // 0-100
  remaining: number
  monthsToTarget: number | null
  estimatedCompletion: string | null
}

export interface WishlistStats {
  totalItems: number
  totalTarget: number
  totalSaved: number
  totalRemaining: number
  overallProgress: number
  completedCount: number
  boughtCount: number
  motivationalMessage: string
}

export function useWishlist() {
  const {
    items,
    initialized,
    initialize,
    addItem: storeAddItem,
    updateItem: storeUpdateItem,
    deleteItem: storeDeleteItem,
    markAsBought: storeMarkAsBought,
    updateSavedAmount: storeUpdateSavedAmount,
    linkToSavings: storeLinkToSavings,
    unlinkFromSavings: storeUnlinkFromSavings,
    syncFromSavings: storeSyncFromSavings,
  } = useWishlistStore()

  const { addTransaction } = useTransactionStore()
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null)
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'date'>('priority')

  /**
   * Calculate progress percentage
   */
  const calculateProgress = useCallback((currentSaved: number, targetPrice: number): number => {
    if (targetPrice <= 0) return 0
    return Math.min((currentSaved / targetPrice) * 100, 100)
  }, [])

  /**
   * Calculate months to reach target
   * Based on average monthly savings (simplified calculation)
   */
  const calculateMonthsToTarget = useCallback((
    currentSaved: number,
    targetPrice: number,
    monthlySavings: number = 500000 // Default assumption
  ): number | null => {
    const remaining = targetPrice - currentSaved
    if (remaining <= 0) return 0
    if (monthlySavings <= 0) return null
    return Math.ceil(remaining / monthlySavings)
  }, [])

  /**
   * Calculate estimated completion date
   */
  const calculateEstimatedCompletion = useCallback((
    currentSaved: number,
    targetPrice: number,
    monthlySavings: number = 500000
  ): string | null => {
    const months = calculateMonthsToTarget(currentSaved, targetPrice, monthlySavings)
    if (months === null || months === 0) return null
    
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date.toISOString().split('T')[0]
  }, [calculateMonthsToTarget])

  /**
   * Generate motivational message based on progress
   */
  const getMotivationalMessage = useCallback((progress: number, completedCount: number, totalCount: number): string => {
    if (completedCount === totalCount && totalCount > 0) {
      return '🎉 Luar biasa! Semua wishlist sudah tercapai!'
    }
    if (progress >= 75) {
      return '💪 Hampir sampai! Terus semangat!'
    }
    if (progress >= 50) {
      return '🚀 Setengah jalan! Kamu bisa!'
    }
    if (progress >= 25) {
      return '✨ Progres bagus! Terus menabung!'
    }
    return '🌟 Mulai perjalananmu menuju impian!'
  }, [])

  /**
   * Add wishlist item with validation
   */
  const addItem = useCallback(async (
    input: WishlistInput
  ): Promise<{ success: boolean; item?: WishlistItem; errors?: string[] }> => {
    const validation = validateWishlistItem(input)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => e.message),
      }
    }

    const item = await storeAddItem(input)
    return { success: true, item }
  }, [storeAddItem])

  /**
   * Update wishlist item
   */
  const updateItem = useCallback(async (
    id: string,
    input: Partial<WishlistInput>
  ): Promise<{ success: boolean; errors?: string[] }> => {
    await storeUpdateItem(id, input)
    return { success: true }
  }, [storeUpdateItem])

  /**
   * Delete wishlist item
   */
  const deleteItem = useCallback(async (id: string): Promise<void> => {
    await storeDeleteItem(id)
  }, [storeDeleteItem])

  /**
   * Mark item as bought with optional transaction creation
   */
  const markAsBought = useCallback(async (
    id: string,
    createTransaction: boolean = false,
    categoryId?: string
  ): Promise<void> => {
    const item = items.find(i => i.id === id)
    if (!item) return

    await storeMarkAsBought(id)

    if (createTransaction && categoryId) {
      const txInput: TransactionInput = {
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        amount: item.targetPrice,
        categoryId,
        note: `Pembelian: ${item.name}`,
      }
      await addTransaction(txInput)
    }
  }, [items, storeMarkAsBought, addTransaction])

  /**
   * Update saved amount
   */
  const updateSavedAmount = useCallback(async (
    id: string,
    amount: number
  ): Promise<void> => {
    await storeUpdateSavedAmount(id, amount)
  }, [storeUpdateSavedAmount])

  /**
   * Get items with progress calculations
   */
  const itemsWithProgress = useMemo((): WishlistItemWithProgress[] => {
    return items.map(item => ({
      ...item,
      progress: calculateProgress(item.currentSaved, item.targetPrice),
      remaining: Math.max(item.targetPrice - item.currentSaved, 0),
      monthsToTarget: calculateMonthsToTarget(item.currentSaved, item.targetPrice),
      estimatedCompletion: calculateEstimatedCompletion(item.currentSaved, item.targetPrice),
    }))
  }, [items, calculateProgress, calculateMonthsToTarget, calculateEstimatedCompletion])

  /**
   * Get unique categories from items
   */
  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return Array.from(cats).sort()
  }, [items])

  /**
   * Filter items by category
   */
  const filterByCategory = useCallback((items: WishlistItemWithProgress[], category: string | null) => {
    if (!category) return items
    return items.filter(item => item.category === category)
  }, [])

  /**
   * Filter items by priority
   */
  const filterByPriority = useCallback((items: WishlistItemWithProgress[], priority: Priority | null) => {
    if (!priority) return items
    return items.filter(item => item.priority === priority)
  }, [])

  /**
   * Sort items
   */
  const sortItems = useCallback((items: WishlistItemWithProgress[], by: 'priority' | 'progress' | 'date') => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return [...items].sort((a, b) => {
      switch (by) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'progress':
          return b.progress - a.progress
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })
  }, [])

  /**
   * Get items sorted by priority
   */
  const itemsByPriority = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return [...itemsWithProgress].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [itemsWithProgress])

  /**
   * Get active items (not bought)
   */
  const activeItems = useMemo(() => {
    return itemsWithProgress.filter(item => item.status !== 'bought')
  }, [itemsWithProgress])

  /**
   * Get bought items
   */
  const boughtItems = useMemo(() => {
    return itemsWithProgress.filter(item => item.status === 'bought')
  }, [itemsWithProgress])

  /**
   * Get total target and saved amounts
   */
  const totals = useMemo(() => {
    const active = activeItems
    return {
      totalTarget: active.reduce((sum, item) => sum + item.targetPrice, 0),
      totalSaved: active.reduce((sum, item) => sum + item.currentSaved, 0),
      totalRemaining: active.reduce((sum, item) => sum + item.remaining, 0),
    }
  }, [activeItems])

  /**
   * Get filtered and sorted items
   */
  const filteredItems = useMemo(() => {
    let result = itemsWithProgress
    result = filterByCategory(result, categoryFilter)
    result = filterByPriority(result, priorityFilter)
    result = sortItems(result, sortBy)
    return result
  }, [itemsWithProgress, categoryFilter, priorityFilter, sortBy, filterByCategory, filterByPriority, sortItems])

  /**
   * Get wishlist stats
   */
  const stats = useMemo((): WishlistStats => {
    const active = activeItems
    const totalTarget = active.reduce((sum, item) => sum + item.targetPrice, 0)
    const totalSaved = active.reduce((sum, item) => sum + item.currentSaved, 0)
    const completedCount = active.filter(item => item.progress >= 100).length
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return {
      totalItems: active.length,
      totalTarget,
      totalSaved,
      totalRemaining: totalTarget - totalSaved,
      overallProgress,
      completedCount,
      boughtCount: boughtItems.length,
      motivationalMessage: getMotivationalMessage(overallProgress, completedCount, active.length),
    }
  }, [activeItems, boughtItems, getMotivationalMessage])

  /**
   * Link wishlist item to savings goal
   */
  const linkToSavings = useCallback(async (id: string, savingsId: string): Promise<void> => {
    await storeLinkToSavings(id, savingsId)
  }, [storeLinkToSavings])

  /**
   * Unlink wishlist item from savings goal
   */
  const unlinkFromSavings = useCallback(async (id: string): Promise<void> => {
    await storeUnlinkFromSavings(id)
  }, [storeUnlinkFromSavings])

  /**
   * Sync wishlist item progress from linked savings
   */
  const syncFromSavings = useCallback(async (id: string, savedAmount: number): Promise<void> => {
    await storeSyncFromSavings(id, savedAmount)
  }, [storeSyncFromSavings])

  return {
    // State
    items,
    wishlist: items, // alias
    itemsWithProgress,
    itemsByPriority,
    activeItems,
    boughtItems,
    filteredItems,
    totals,
    stats,
    categories,
    initialized,

    // Filter state
    categoryFilter,
    priorityFilter,
    sortBy,
    setCategoryFilter,
    setPriorityFilter,
    setSortBy,

    // Actions
    initialize,
    addItem,
    updateItem,
    deleteItem,
    markAsBought,
    updateSavedAmount,
    linkToSavings,
    unlinkFromSavings,
    syncFromSavings,

    // Calculations
    calculateProgress,
    calculateMonthsToTarget,
    calculateEstimatedCompletion,
    getMotivationalMessage,
    filterByCategory,
    filterByPriority,
    sortItems,
  }
}
