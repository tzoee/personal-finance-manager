/**
 * Savings Store
 * Manages savings goals and deposits with Zustand
 */

import { create } from 'zustand'
import type { SavingsGoal, SavingsDeposit, SavingsGoalInput, SavingsDepositInput } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO } from '../utils/dateUtils'

interface SavingsState {
  savings: SavingsGoal[]
  initialized: boolean
  initialize: () => Promise<void>
  addSavings: (input: SavingsGoalInput) => Promise<SavingsGoal>
  updateSavings: (id: string, input: Partial<SavingsGoalInput>) => Promise<void>
  deleteSavings: (id: string) => Promise<void>
  addDeposit: (savingsId: string, input: SavingsDepositInput) => Promise<SavingsDeposit>
  removeDeposit: (savingsId: string, depositId: string) => Promise<void>
  getSavingsById: (id: string) => SavingsGoal | undefined
  getTotalSaved: (savingsId: string) => number
  getProgress: (savingsId: string) => number
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  savings: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_savings')
      const savings = stored ? JSON.parse(stored) as SavingsGoal[] : []
      set({ savings, initialized: true })
    } catch {
      set({ savings: [], initialized: true })
    }
  },

  addSavings: async (input: SavingsGoalInput) => {
    const { savings } = get()
    const now = getNowISO()

    const newSavings: SavingsGoal = {
      id: generateId(),
      name: input.name.trim(),
      targetAmount: input.targetAmount,
      targetDate: input.targetDate,
      linkedWishlistId: input.linkedWishlistId,
      deposits: [],
      note: input.note,
      createdAt: now,
      updatedAt: now,
    }

    const updated = [...savings, newSavings]
    localStorage.setItem('pfm_savings', JSON.stringify(updated))
    set({ savings: updated })

    return newSavings
  },

  updateSavings: async (id: string, input: Partial<SavingsGoalInput>) => {
    const { savings } = get()
    const now = getNowISO()

    const updated = savings.map(s => {
      if (s.id === id) {
        return {
          ...s,
          ...input,
          name: input.name?.trim() ?? s.name,
          updatedAt: now,
        }
      }
      return s
    })

    localStorage.setItem('pfm_savings', JSON.stringify(updated))
    set({ savings: updated })
  },

  deleteSavings: async (id: string) => {
    const { savings } = get()
    const updated = savings.filter(s => s.id !== id)
    localStorage.setItem('pfm_savings', JSON.stringify(updated))
    set({ savings: updated })
  },

  addDeposit: async (savingsId: string, input: SavingsDepositInput) => {
    const { savings } = get()
    const now = getNowISO()

    const newDeposit: SavingsDeposit = {
      id: generateId(),
      savingsId,
      amount: input.amount,
      date: input.date || now.split('T')[0],
      note: input.note,
      createdAt: now,
    }

    const updated = savings.map(s => {
      if (s.id === savingsId) {
        return {
          ...s,
          deposits: [...s.deposits, newDeposit],
          updatedAt: now,
        }
      }
      return s
    })

    localStorage.setItem('pfm_savings', JSON.stringify(updated))
    set({ savings: updated })

    return newDeposit
  },

  removeDeposit: async (savingsId: string, depositId: string) => {
    const { savings } = get()
    const now = getNowISO()

    const updated = savings.map(s => {
      if (s.id === savingsId) {
        return {
          ...s,
          deposits: s.deposits.filter(d => d.id !== depositId),
          updatedAt: now,
        }
      }
      return s
    })

    localStorage.setItem('pfm_savings', JSON.stringify(updated))
    set({ savings: updated })
  },

  getSavingsById: (id: string) => {
    const { savings } = get()
    return savings.find(s => s.id === id)
  },

  getTotalSaved: (savingsId: string) => {
    const { savings } = get()
    const s = savings.find(s => s.id === savingsId)
    if (!s) return 0
    return s.deposits.reduce((sum, d) => sum + d.amount, 0)
  },

  getProgress: (savingsId: string) => {
    const { savings, getTotalSaved } = get()
    const s = savings.find(s => s.id === savingsId)
    if (!s || s.targetAmount <= 0) return 0
    const total = getTotalSaved(savingsId)
    return Math.min(100, (total / s.targetAmount) * 100)
  },
}))

/**
 * Calculate total saved from deposits
 */
export function calculateTotalSaved(deposits: SavingsDeposit[]): number {
  return deposits.reduce((sum, d) => sum + d.amount, 0)
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(totalSaved: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0
  return Math.min(100, (totalSaved / targetAmount) * 100)
}
