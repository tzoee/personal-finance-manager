/**
 * useSavings Hook
 * Provides savings goals management with deposit tracking
 */

import { useCallback, useMemo } from 'react'
import { useSavingsStore, calculateTotalSaved, calculateProgress } from '../store/savingsStore'
import type { SavingsGoal, SavingsGoalInput, SavingsDepositInput } from '../types'

export interface SavingsWithDetails extends SavingsGoal {
  totalSaved: number
  remaining: number
  progress: number
  isComplete: boolean
  daysUntilTarget: number | null
  estimatedCompletion: string | null
}

export function useSavings() {
  const {
    savings,
    initialized,
    initialize,
    addSavings: storeAddSavings,
    updateSavings: storeUpdateSavings,
    deleteSavings: storeDeleteSavings,
    addDeposit: storeAddDeposit,
    removeDeposit: storeRemoveDeposit,
  } = useSavingsStore()

  /**
   * Add savings goal with validation
   */
  const addSavings = useCallback(async (
    input: SavingsGoalInput
  ): Promise<{ success: boolean; savings?: SavingsGoal; errors?: string[] }> => {
    if (!input.name.trim()) {
      return { success: false, errors: ['Nama tabungan wajib diisi'] }
    }
    if (input.targetAmount <= 0) {
      return { success: false, errors: ['Target harus lebih dari 0'] }
    }

    const result = await storeAddSavings(input)
    return { success: true, savings: result }
  }, [storeAddSavings])

  /**
   * Update savings goal
   */
  const updateSavings = useCallback(async (
    id: string,
    input: Partial<SavingsGoalInput>
  ): Promise<{ success: boolean }> => {
    await storeUpdateSavings(id, input)
    return { success: true }
  }, [storeUpdateSavings])

  /**
   * Delete savings goal
   */
  const deleteSavings = useCallback(async (id: string): Promise<void> => {
    await storeDeleteSavings(id)
  }, [storeDeleteSavings])

  /**
   * Add deposit to savings
   */
  const addDeposit = useCallback(async (
    savingsId: string,
    input: SavingsDepositInput
  ): Promise<{ success: boolean; error?: string }> => {
    if (input.amount <= 0) {
      return { success: false, error: 'Jumlah harus lebih dari 0' }
    }

    await storeAddDeposit(savingsId, input)
    return { success: true }
  }, [storeAddDeposit])

  /**
   * Remove deposit from savings
   */
  const removeDeposit = useCallback(async (
    savingsId: string,
    depositId: string
  ): Promise<void> => {
    await storeRemoveDeposit(savingsId, depositId)
  }, [storeRemoveDeposit])

  /**
   * Calculate days until target date
   */
  const calculateDaysUntilTarget = (targetDate?: string): number | null => {
    if (!targetDate) return null
    const target = new Date(targetDate)
    const now = new Date()
    const diff = target.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * Estimate completion date based on average deposit rate
   */
  const estimateCompletion = (
    totalSaved: number,
    targetAmount: number,
    deposits: { date: string; amount: number }[]
  ): string | null => {
    if (totalSaved >= targetAmount) return null
    if (deposits.length < 2) return null

    // Calculate average monthly deposit
    const sortedDeposits = [...deposits].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const firstDate = new Date(sortedDeposits[0].date)
    const lastDate = new Date(sortedDeposits[sortedDeposits.length - 1].date)
    const monthsDiff = Math.max(1, 
      (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
      (lastDate.getMonth() - firstDate.getMonth())
    )
    
    const avgMonthlyDeposit = totalSaved / monthsDiff
    if (avgMonthlyDeposit <= 0) return null

    const remaining = targetAmount - totalSaved
    const monthsToComplete = Math.ceil(remaining / avgMonthlyDeposit)
    
    const completionDate = new Date()
    completionDate.setMonth(completionDate.getMonth() + monthsToComplete)
    
    return completionDate.toISOString().split('T')[0]
  }

  /**
   * Savings with calculated details
   */
  const savingsWithDetails = useMemo((): SavingsWithDetails[] => {
    return savings.map(s => {
      const totalSaved = calculateTotalSaved(s.deposits)
      const remaining = Math.max(0, s.targetAmount - totalSaved)
      const progress = calculateProgress(totalSaved, s.targetAmount)
      const isComplete = totalSaved >= s.targetAmount
      const daysUntilTarget = calculateDaysUntilTarget(s.targetDate)
      const estimatedCompletion = estimateCompletion(totalSaved, s.targetAmount, s.deposits)

      return {
        ...s,
        totalSaved,
        remaining,
        progress,
        isComplete,
        daysUntilTarget,
        estimatedCompletion,
      }
    })
  }, [savings])

  /**
   * Get totals
   */
  const totals = useMemo(() => {
    const totalTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0)
    const totalSaved = savingsWithDetails.reduce((sum, s) => sum + s.totalSaved, 0)
    const completedCount = savingsWithDetails.filter(s => s.isComplete).length
    const inProgressCount = savingsWithDetails.filter(s => !s.isComplete).length

    return {
      totalTarget,
      totalSaved,
      totalRemaining: totalTarget - totalSaved,
      overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
      completedCount,
      inProgressCount,
      totalCount: savings.length,
    }
  }, [savings, savingsWithDetails])

  return {
    // State
    savings,
    savingsWithDetails,
    totals,
    initialized,

    // Actions
    initialize,
    addSavings,
    updateSavings,
    deleteSavings,
    addDeposit,
    removeDeposit,
  }
}
