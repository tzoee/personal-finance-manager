/**
 * useInstallments Hook
 * Provides installment management with calculations
 */

import { useCallback, useMemo } from 'react'
import { useInstallmentStore } from '../store/installmentStore'
import { validateInstallment } from '../utils/validators'
import type { Installment, InstallmentInput } from '../types'

export interface InstallmentWithDetails extends Installment {
  remainingMonths: number
  remainingAmount: number
  totalAmount: number
  paidAmount: number
  progressPercentage: number
}

export function useInstallments() {
  const {
    installments,
    initialized,
    initialize,
    addInstallment: storeAddInstallment,
    updateInstallment: storeUpdateInstallment,
    deleteInstallment: storeDeleteInstallment,
    getActiveInstallments,
    updateInstallmentStatuses,
  } = useInstallmentStore()

  /**
   * Add installment with validation
   */
  const addInstallment = useCallback(async (
    input: InstallmentInput
  ): Promise<{ success: boolean; installment?: Installment; errors?: string[] }> => {
    const validation = validateInstallment(input)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => e.message),
      }
    }

    const installment = await storeAddInstallment(input)
    return { success: true, installment }
  }, [storeAddInstallment])

  /**
   * Update installment
   */
  const updateInstallment = useCallback(async (
    id: string,
    input: Partial<InstallmentInput>
  ): Promise<{ success: boolean; errors?: string[] }> => {
    await storeUpdateInstallment(id, input)
    return { success: true }
  }, [storeUpdateInstallment])

  /**
   * Delete installment
   */
  const deleteInstallment = useCallback(async (id: string): Promise<void> => {
    await storeDeleteInstallment(id)
  }, [storeDeleteInstallment])

  /**
   * Calculate installment details
   */
  const calculateDetails = useCallback((installment: Installment): InstallmentWithDetails => {
    const totalAmount = installment.monthlyAmount * installment.totalTenor
    const paidAmount = installment.monthlyAmount * Math.min(installment.currentMonth, installment.totalTenor)
    const remainingMonths = Math.max(installment.totalTenor - installment.currentMonth, 0)
    const remainingAmount = installment.monthlyAmount * remainingMonths
    const progressPercentage = (installment.currentMonth / installment.totalTenor) * 100

    return {
      ...installment,
      remainingMonths,
      remainingAmount,
      totalAmount,
      paidAmount,
      progressPercentage: Math.min(progressPercentage, 100),
    }
  }, [])

  /**
   * Get installments with calculated details
   */
  const installmentsWithDetails = useMemo((): InstallmentWithDetails[] => {
    return installments.map(calculateDetails)
  }, [installments, calculateDetails])

  /**
   * Get active installments with details
   */
  const activeInstallments = useMemo(() => {
    return installmentsWithDetails.filter(i => i.status === 'active')
  }, [installmentsWithDetails])

  /**
   * Get paid off installments
   */
  const paidOffInstallments = useMemo(() => {
    return installmentsWithDetails.filter(i => i.status === 'paid_off')
  }, [installmentsWithDetails])

  /**
   * Get total monthly installment amount
   */
  const totalMonthlyAmount = useMemo(() => {
    return activeInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0)
  }, [activeInstallments])

  /**
   * Get total remaining amount across all active installments
   */
  const totalRemainingAmount = useMemo(() => {
    return activeInstallments.reduce((sum, i) => sum + i.remainingAmount, 0)
  }, [activeInstallments])

  return {
    // State
    installments,
    installmentsWithDetails,
    activeInstallments,
    paidOffInstallments,
    totalMonthlyAmount,
    totalRemainingAmount,
    initialized,

    // Actions
    initialize,
    addInstallment,
    updateInstallment,
    deleteInstallment,
    updateInstallmentStatuses,

    // Queries
    getActiveInstallments,
    calculateDetails,
  }
}
