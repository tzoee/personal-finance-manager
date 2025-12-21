import { create } from 'zustand'
import type { Installment, InstallmentInput } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO } from '../utils/dateUtils'
import { calculateInstallmentCurrentMonth } from '../utils/calculations'

interface InstallmentState {
  installments: Installment[]
  initialized: boolean
  initialize: () => Promise<void>
  addInstallment: (input: InstallmentInput) => Promise<Installment>
  updateInstallment: (id: string, input: Partial<InstallmentInput>) => Promise<void>
  deleteInstallment: (id: string) => Promise<void>
  getActiveInstallments: () => Installment[]
  updateInstallmentStatuses: () => Promise<void>
}

export const useInstallmentStore = create<InstallmentState>((set, get) => ({
  installments: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_installments')
      if (stored) {
        const parsed = JSON.parse(stored) as Installment[]
        // Update current month positions
        const updated = parsed.map(inst => ({
          ...inst,
          currentMonth: calculateInstallmentCurrentMonth(inst.startDate),
          status: calculateInstallmentCurrentMonth(inst.startDate) >= inst.totalTenor ? 'paid_off' as const : inst.status,
        }))
        localStorage.setItem('pfm_installments', JSON.stringify(updated))
        set({ installments: updated, initialized: true })
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
    const currentMonth = calculateInstallmentCurrentMonth(input.startDate)

    const newInstallment: Installment = {
      id: generateId(),
      name: input.name.trim(),
      totalTenor: input.totalTenor,
      currentMonth,
      monthlyAmount: input.monthlyAmount,
      startDate: input.startDate,
      subcategory: input.subcategory,
      status: currentMonth >= input.totalTenor ? 'paid_off' : 'active',
      autoGenerateTransaction: input.autoGenerateTransaction ?? false,
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
        const startDate = input.startDate ?? inst.startDate
        const totalTenor = input.totalTenor ?? inst.totalTenor
        const currentMonth = calculateInstallmentCurrentMonth(startDate)

        return {
          ...inst,
          ...input,
          name: input.name?.trim() ?? inst.name,
          currentMonth,
          status: currentMonth >= totalTenor ? 'paid_off' as const : 'active' as const,
          updatedAt: now,
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
      const currentMonth = calculateInstallmentCurrentMonth(inst.startDate)
      const newStatus = currentMonth >= inst.totalTenor ? 'paid_off' as const : 'active' as const

      if (inst.currentMonth !== currentMonth || inst.status !== newStatus) {
        return {
          ...inst,
          currentMonth,
          status: newStatus,
          updatedAt: now,
        }
      }
      return inst
    })

    localStorage.setItem('pfm_installments', JSON.stringify(updated))
    set({ installments: updated })
  },
}))
