import { create } from 'zustand'
import type { Installment, InstallmentInput, InstallmentPayment, InstallmentPaymentInput } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO } from '../utils/dateUtils'

/**
 * Calculate installment status based on payments (not date-based)
 * This fixes the bug where tenor 1 month was immediately marked as paid_off
 */
export function calculateInstallmentStatusFromPayments(installment: Installment): {
  status: 'active' | 'paid_off'
  currentMonth: number
  totalPaid: number
  periodPaid: number
  remainingThisPeriod: number
} {
  const payments = installment.payments || []
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalRequired = installment.totalTenor * installment.monthlyAmount
  
  // Calculate completed months based on payments
  const completedMonths = Math.floor(totalPaid / installment.monthlyAmount)
  const periodPaid = totalPaid % installment.monthlyAmount
  
  // Status is paid_off only when total paid >= total required
  const status = totalPaid >= totalRequired ? 'paid_off' : 'active'
  
  return {
    status,
    currentMonth: Math.min(completedMonths, installment.totalTenor),
    totalPaid,
    periodPaid,
    remainingThisPeriod: installment.monthlyAmount - periodPaid
  }
}

interface InstallmentState {
  installments: Installment[]
  initialized: boolean
  initialize: () => Promise<void>
  addInstallment: (input: InstallmentInput) => Promise<Installment>
  updateInstallment: (id: string, input: Partial<InstallmentInput>) => Promise<void>
  deleteInstallment: (id: string) => Promise<void>
  getActiveInstallments: () => Installment[]
  updateInstallmentStatuses: () => Promise<void>
  // Payment functions
  addPayment: (installmentId: string, input: InstallmentPaymentInput) => Promise<InstallmentPayment | null>
  getPayments: (installmentId: string) => InstallmentPayment[]
}

export const useInstallmentStore = create<InstallmentState>((set, get) => ({
  installments: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_installments')
      if (stored) {
        const parsed = JSON.parse(stored) as Installment[]
        // Migrate: ensure all installments have payments array
        const migrated = parsed.map(inst => {
          const payments = inst.payments || []
          const { status, currentMonth } = calculateInstallmentStatusFromPayments({ ...inst, payments })
          return {
            ...inst,
            payments,
            currentMonth,
            status,
          }
        })
        localStorage.setItem('pfm_installments', JSON.stringify(migrated))
        set({ installments: migrated, initialized: true })
      } else {
        set({ installments: [], initialized: true })
      }
    } catch {
      set({ installments: [], initialized: true })
    }
  },

  addInstallment: async (input: InstallmentInput) => {
    const { installments } = get()
    const now = getNowISO()

    // New installments always start as active with empty payments
    const newInstallment: Installment = {
      id: generateId(),
      name: input.name.trim(),
      totalTenor: input.totalTenor,
      currentMonth: 0, // Always start at 0
      monthlyAmount: input.monthlyAmount,
      startDate: input.startDate,
      subcategory: input.subcategory,
      status: 'active', // Always start as active
      autoGenerateTransaction: input.autoGenerateTransaction ?? false,
      payments: [], // Empty payments array
      createdAt: now,
      updatedAt: now,
    }

    const updated = [...installments, newInstallment]
    localStorage.setItem('pfm_installments', JSON.stringify(updated))
    set({ installments: updated })

    return newInstallment
  },

  updateInstallment: async (id: string, input: Partial<InstallmentInput>) => {
    const { installments } = get()
    const now = getNowISO()

    const updated = installments.map(inst => {
      if (inst.id === id) {
        const updatedInst = {
          ...inst,
          ...input,
          name: input.name?.trim() ?? inst.name,
          updatedAt: now,
        }
        // Recalculate status based on payments
        const { status, currentMonth } = calculateInstallmentStatusFromPayments(updatedInst)
        return {
          ...updatedInst,
          currentMonth,
          status,
        }
      }
      return inst
    })

    localStorage.setItem('pfm_installments', JSON.stringify(updated))
    set({ installments: updated })
  },

  deleteInstallment: async (id: string) => {
    const { installments } = get()
    const updated = installments.filter(inst => inst.id !== id)
    localStorage.setItem('pfm_installments', JSON.stringify(updated))
    set({ installments: updated })
  },

  getActiveInstallments: () => {
    return get().installments.filter(inst => inst.status === 'active')
  },

  updateInstallmentStatuses: async () => {
    const { installments } = get()
    const now = getNowISO()

    const updated = installments.map(inst => {
      const { status, currentMonth } = calculateInstallmentStatusFromPayments(inst)

      if (inst.currentMonth !== currentMonth || inst.status !== status) {
        return {
          ...inst,
          currentMonth,
          status,
          updatedAt: now,
        }
      }
      return inst
    })

    localStorage.setItem('pfm_installments', JSON.stringify(updated))
    set({ installments: updated })
  },

  addPayment: async (installmentId: string, input: InstallmentPaymentInput) => {
    const { installments } = get()
    const now = getNowISO()
    
    const installment = installments.find(i => i.id === installmentId)
    if (!installment || installment.status === 'paid_off') {
      return null
    }

    const newPayment: InstallmentPayment = {
      id: generateId(),
      installmentId,
      amount: input.amount,
      date: input.date || now.split('T')[0],
      note: input.note,
      createdAt: now,
    }

    const updated = installments.map(inst => {
      if (inst.id === installmentId) {
        const updatedPayments = [...(inst.payments || []), newPayment]
        const updatedInst = { ...inst, payments: updatedPayments, updatedAt: now }
        const { status, currentMonth } = calculateInstallmentStatusFromPayments(updatedInst)
        return {
          ...updatedInst,
          currentMonth,
          status,
        }
      }
      return inst
    })

    localStorage.setItem('pfm_installments', JSON.stringify(updated))
    set({ installments: updated })

    return newPayment
  },

  getPayments: (installmentId: string) => {
    const installment = get().installments.find(i => i.id === installmentId)
    return installment?.payments || []
  },
}))
