/**
 * useInstallments Hook
 * Provides installment management with calculations
 */

import { useCallback, useMemo } from 'react'
import { useInstallmentStore, calculateInstallmentStatusFromPayments } from '../store/installmentStore'
import { validateInstallment } from '../utils/validators'
import type { Installment, InstallmentInput, InstallmentPayment, InstallmentPaymentInput } from '../types'

export interface InstallmentWithDetails extends Installment {
  remainingMonths: number
  remainingAmount: number
  totalAmount: number
  paidAmount: number
  progressPercentage: number
  periodPaid: number // Amount paid in current period
  remainingThisPeriod: number // Remaining to complete current period
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
    addPayment: storeAddPayment,
    getPayments: storeGetPayments,
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
   * Calculate installment details using payment-based calculation
   */
  const calculateDetails = useCallback((installment: Installment): InstallmentWithDetails => {
    const totalAmount = installment.monthlyAmount * installment.totalTenor
    
    // Use payment-based calculation
    const { totalPaid, currentMonth, periodPaid, remainingThisPeriod } = 
      calculateInstallmentStatusFromPayments(installment)
    
    const remainingMonths = Math.max(installment.totalTenor - currentMonth, 0)
    const remainingAmount = Math.max(totalAmount - totalPaid, 0)
    const progressPercentage = (totalPaid / totalAmount) * 100

    return {
      ...installment,
      remainingMonths,
      remainingAmount,
      totalAmount,
      paidAmount: totalPaid,
      progressPercentage: Math.min(progressPercentage, 100),
      periodPaid,
      remainingThisPeriod,
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

  /**
   * Add payment to an installment
   */
  const addPayment = useCallback(async (
    installmentId: string,
    input: InstallmentPaymentInput
  ): Promise<{ success: boolean; payment?: InstallmentPayment; error?: string }> => {
    if (input.amount <= 0) {
      return { success: false, error: 'Jumlah pembayaran harus lebih dari 0' }
    }

    const payment = await storeAddPayment(installmentId, input)
    if (!payment) {
      return { success: false, error: 'Cicilan tidak ditemukan atau sudah lunas' }
    }

    return { success: true, payment }
  }, [storeAddPayment])

  /**
   * Get payment history for an installment
   */
  const getPaymentHistory = useCallback((installmentId: string): InstallmentPayment[] => {
    return storeGetPayments(installmentId)
  }, [storeGetPayments])

  /**
   * Get installment by ID with details
   */
  const getInstallmentById = useCallback((id: string): InstallmentWithDetails | undefined => {
    const installment = installments.find(i => i.id === id)
    return installment ? calculateDetails(installment) : undefined
  }, [installments, calculateDetails])

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
    addPayment,

    // Queries
    getActiveInstallments,
    calculateDetails,
    getPaymentHistory,
    getInstallmentById,
  }
}
