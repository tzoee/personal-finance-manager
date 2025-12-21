import { create } from 'zustand'
import type { MonthlyNeed, MonthlyNeedPayment, MonthlyNeedInput } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO, getCurrentYearMonth } from '../utils/dateUtils'

interface MonthlyNeedState {
  needs: MonthlyNeed[]
  payments: MonthlyNeedPayment[]
  initialized: boolean
  initialize: () => Promise<void>
  addNeed: (input: MonthlyNeedInput) => Promise<MonthlyNeed>
  updateNeed: (id: string, input: Partial<MonthlyNeedInput>) => Promise<void>
  deleteNeed: (id: string) => Promise<void>
  markAsPaid: (needId: string, actualAmount: number, transactionId?: string) => Promise<MonthlyNeedPayment>
  unmarkAsPaid: (needId: string, yearMonth: string) => Promise<void>
  isNeedPaid: (needId: string, yearMonth?: string) => boolean
  getPaymentForMonth: (needId: string, yearMonth: string) => MonthlyNeedPayment | undefined
}

export const useMonthlyNeedStore = create<MonthlyNeedState>((set, get) => ({
  needs: [],
  payments: [],
  initialized: false,

  initialize: async () => {
    try {
      const storedNeeds = localStorage.getItem('pfm_monthly_needs')
      const storedPayments = localStorage.getItem('pfm_monthly_need_payments')

      const needs = storedNeeds ? JSON.parse(storedNeeds) as MonthlyNeed[] : []
      const payments = storedPayments ? JSON.parse(storedPayments) as MonthlyNeedPayment[] : []

      set({ needs, payments, initialized: true })
    } catch {
      set({ needs: [], payments: [], initialized: true })
    }
  },

  addNeed: async (input: MonthlyNeedInput) => {
    const { needs } = get()
    const now = getNowISO()

    const newNeed: MonthlyNeed = {
      id: generateId(),
      name: input.name.trim(),
      budgetAmount: input.budgetAmount,
      dueDay: input.dueDay,
      subcategory: input.subcategory,
      note: input.note,
      createdAt: now,
    }

    const updated = [...needs, newNeed]
    localStorage.setItem('pfm_monthly_needs', JSON.stringify(updated))
    set({ needs: updated })

    return newNeed
  },

  updateNeed: async (id: string, input: Partial<MonthlyNeedInput>) => {
    const { needs } = get()

    const updated = needs.map(need => {
      if (need.id === id) {
        return {
          ...need,
          ...input,
          name: input.name?.trim() ?? need.name,
        }
      }
      return need
    })

    localStorage.setItem('pfm_monthly_needs', JSON.stringify(updated))
    set({ needs: updated })
  },

  deleteNeed: async (id: string) => {
    const { needs, payments } = get()
    const updatedNeeds = needs.filter(need => need.id !== id)
    const updatedPayments = payments.filter(payment => payment.needId !== id)

    localStorage.setItem('pfm_monthly_needs', JSON.stringify(updatedNeeds))
    localStorage.setItem('pfm_monthly_need_payments', JSON.stringify(updatedPayments))
    set({ needs: updatedNeeds, payments: updatedPayments })
  },

  markAsPaid: async (needId: string, actualAmount: number, transactionId?: string) => {
    const { payments } = get()
    const now = getNowISO()
    const yearMonth = getCurrentYearMonth()

    // Check if already paid this month
    const existing = payments.find(p => p.needId === needId && p.yearMonth === yearMonth)
    if (existing) {
      // Update existing payment
      const updated = payments.map(p => {
        if (p.id === existing.id) {
          return { ...p, actualAmount, transactionId, paidAt: now }
        }
        return p
      })
      localStorage.setItem('pfm_monthly_need_payments', JSON.stringify(updated))
      set({ payments: updated })
      return existing
    }

    // Create new payment
    const newPayment: MonthlyNeedPayment = {
      id: generateId(),
      needId,
      yearMonth,
      actualAmount,
      paidAt: now,
      transactionId,
    }

    const updated = [...payments, newPayment]
    localStorage.setItem('pfm_monthly_need_payments', JSON.stringify(updated))
    set({ payments: updated })

    return newPayment
  },

  unmarkAsPaid: async (needId: string, yearMonth: string) => {
    const { payments } = get()
    const updated = payments.filter(p => !(p.needId === needId && p.yearMonth === yearMonth))
    localStorage.setItem('pfm_monthly_need_payments', JSON.stringify(updated))
    set({ payments: updated })
  },

  isNeedPaid: (needId: string, yearMonth?: string) => {
    const { payments } = get()
    const month = yearMonth ?? getCurrentYearMonth()
    return payments.some(p => p.needId === needId && p.yearMonth === month)
  },

  getPaymentForMonth: (needId: string, yearMonth: string) => {
    const { payments } = get()
    return payments.find(p => p.needId === needId && p.yearMonth === yearMonth)
  },
}))
