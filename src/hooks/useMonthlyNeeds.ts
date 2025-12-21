/**
 * useMonthlyNeeds Hook
 * Provides monthly needs management with budget comparison and recurrence support
 */

import { useCallback, useMemo } from 'react'
import { useMonthlyNeedStore, shouldShowForMonth, getRecurrenceLabel } from '../store/monthlyNeedStore'
import { validateMonthlyNeed } from '../utils/validators'
import type { MonthlyNeed, MonthlyNeedInput, BudgetComparison } from '../types'

export interface MonthlyNeedWithStatus extends MonthlyNeed {
  isPaid: boolean
  actualAmount: number
  difference: number
  isOverBudget: boolean
  recurrenceLabel: string
}

export function useMonthlyNeeds() {
  const {
    needs,
    payments,
    initialized,
    initialize,
    addNeed: storeAddNeed,
    updateNeed: storeUpdateNeed,
    deleteNeed: storeDeleteNeed,
    markAsPaid: storeMarkAsPaid,
    unmarkAsPaid: storeUnmarkAsPaid,
    getNeedsForMonth,
  } = useMonthlyNeedStore()

  /**
   * Get current year-month string
   */
  const getCurrentYearMonth = useCallback(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  /**
   * Add monthly need with validation
   */
  const addNeed = useCallback(async (
    input: MonthlyNeedInput
  ): Promise<{ success: boolean; need?: MonthlyNeed; errors?: string[] }> => {
    const validation = validateMonthlyNeed(input)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => e.message),
      }
    }

    const need = await storeAddNeed(input)
    return { success: true, need }
  }, [storeAddNeed])

  /**
   * Update monthly need
   */
  const updateNeed = useCallback(async (
    id: string,
    input: Partial<MonthlyNeedInput>
  ): Promise<{ success: boolean; errors?: string[] }> => {
    await storeUpdateNeed(id, input)
    return { success: true }
  }, [storeUpdateNeed])

  /**
   * Delete monthly need
   */
  const deleteNeed = useCallback(async (id: string): Promise<void> => {
    await storeDeleteNeed(id)
  }, [storeDeleteNeed])

  /**
   * Mark need as paid for current month
   */
  const markAsPaid = useCallback(async (
    needId: string,
    actualAmount: number
  ): Promise<void> => {
    await storeMarkAsPaid(needId, actualAmount)
  }, [storeMarkAsPaid])

  /**
   * Unmark need as paid
   */
  const unmarkAsPaid = useCallback(async (needId: string): Promise<void> => {
    const yearMonth = getCurrentYearMonth()
    await storeUnmarkAsPaid(needId, yearMonth)
  }, [getCurrentYearMonth, storeUnmarkAsPaid])

  /**
   * Get needs with payment status for current month (filtered by recurrence)
   */
  const needsWithStatus = useMemo((): MonthlyNeedWithStatus[] => {
    const yearMonth = getCurrentYearMonth()
    
    // Filter needs by recurrence period
    const filteredNeeds = getNeedsForMonth(yearMonth)
    
    return filteredNeeds.map(need => {
      const payment = payments.find(
        p => p.needId === need.id && p.yearMonth === yearMonth
      )
      const isPaid = !!payment
      const actualAmount = payment?.actualAmount || 0
      const difference = need.budgetAmount - actualAmount
      const isOverBudget = actualAmount > need.budgetAmount
      const recurrenceLabel = getRecurrenceLabel(need.recurrencePeriod || 'forever')

      return {
        ...need,
        isPaid,
        actualAmount,
        difference,
        isOverBudget,
        recurrenceLabel,
      }
    })
  }, [needs, payments, getCurrentYearMonth, getNeedsForMonth])

  /**
   * Get budget comparison for current month
   */
  const budgetComparison = useMemo((): BudgetComparison[] => {
    return needsWithStatus.map(need => ({
      needId: need.id,
      name: need.name,
      budget: need.budgetAmount,
      actual: need.actualAmount,
      difference: need.difference,
      isOverBudget: need.isOverBudget,
    }))
  }, [needsWithStatus])

  /**
   * Get totals
   */
  const totals = useMemo(() => {
    const totalBudget = needs.reduce((sum, n) => sum + n.budgetAmount, 0)
    const totalActual = needsWithStatus.reduce((sum, n) => sum + n.actualAmount, 0)
    const paidCount = needsWithStatus.filter(n => n.isPaid).length
    const unpaidCount = needsWithStatus.filter(n => !n.isPaid).length

    return {
      totalBudget,
      totalActual,
      difference: totalBudget - totalActual,
      paidCount,
      unpaidCount,
    }
  }, [needs, needsWithStatus])

  return {
    // State
    needs,
    needsWithStatus,
    budgetComparison,
    totals,
    initialized,

    // Actions
    initialize,
    addNeed,
    updateNeed,
    deleteNeed,
    markAsPaid,
    unmarkAsPaid,

    // Utilities
    getRecurrenceLabel,
    shouldShowForMonth,
  }
}
