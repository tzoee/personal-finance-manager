/**
 * useWishlist Hook
 * Provides wishlist management with progress calculations
 */

import { useCallback, useMemo } from 'react'
import { useWishlistStore } from '../store/wishlistStore'
import { useTransactionStore } from '../store/transactionStore'
import { validateWishlistItem } from '../utils/validators'
import type { WishlistItem, WishlistInput, TransactionInput } from '../types'

export interface WishlistItemWithProgress extends WishlistItem {
  progress: number // 0-100
  remaining: number
  monthsToTarget: number | null
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
  } = useWishlistStore()

  const { addTransaction } = useTransactionStore()

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
    }))
  }, [items, calculateProgress, calculateMonthsToTarget])

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

  return {
    // State
    items,
    itemsWithProgress,
    itemsByPriority,
    activeItems,
    boughtItems,
    totals,
    initialized,

    // Actions
    initialize,
    addItem,
    updateItem,
    deleteItem,
    markAsBought,
    updateSavedAmount,

    // Calculations
    calculateProgress,
    calculateMonthsToTarget,
  }
}
