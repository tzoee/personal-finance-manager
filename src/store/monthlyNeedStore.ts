import { create } from 'zustand'
import type { MonthlyNeed, MonthlyNeedPayment, MonthlyNeedInput, RecurrencePeriod } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO, getCurrentYearMonth } from '../utils/dateUtils'

/**
 * Check if a monthly need should be shown for a specific month based on recurrence
 * @param need The monthly need to check
 * @param targetMonth The month to check (YYYY-MM format)
 * @returns true if the need should be shown for the target month
 */
export function shouldShowForMonth(need: MonthlyNeed, targetMonth: string): boolean {
  const recurrence = need.recurrencePeriod || 'forever'
  const startMonth = need.startMonth || need.createdAt.substring(0, 7)
  
  // Parse months
  const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number)
  const [startYear, startMonthNum] = startMonth.split('-').map(Number)
  
  // Calculate months difference
  const targetTotalMonths = targetYear * 12 + targetMonthNum
  const startTotalMonths = startYear * 12 + startMonthNum
  const monthsDiff = targetTotalMonths - startTotalMonths
  
  // Don't show for months before start
  if (monthsDiff < 0) return false
  
  switch (recurrence) {
    case 'monthly':
      // Show for 12 months from start
      return monthsDiff < 12
    
    case 'yearly':
      // Show only on the same month each year
      return targetMonthNum === startMonthNum
    
    case 'forever':
    default:
      // Always show
      return true
  }
}

/**
 * Get recurrence label for display
 */
export function getRecurrenceLabel(period: RecurrencePeriod): string {
  switch (period) {
    case 'monthly': return 'Bulanan (12 bulan)'
    case 'yearly': return 'Tahunan'
    case 'forever': return 'Selamanya'
    default: return 'Selamanya'
  }
}

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
  getNeedsForMonth: (yearMonth: string) => MonthlyNeed[]
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
    const currentMonth = getCurrentYearMonth()

    const newNeed: MonthlyNeed = {
      id: generateId(),
      name: input.name.trim(),
      budgetAmount: input.budgetAmount,
      dueDay: input.dueDay,
      subcategory: input.subcategory,
      recurrencePeriod: input.recurrencePeriod || 'forever',
      startMonth: input.startMonth || currentMonth,
      autoGenerateTransaction: input.autoGenerateTransaction || false,
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

  getNeedsForMonth: (yearMonth: string) => {
    const { needs } = get()
    return needs.filter(need => shouldShowForMonth(need, yearMonth))
  },
}))
