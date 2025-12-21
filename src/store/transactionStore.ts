import { create } from 'zustand'
import type { Transaction, TransactionInput, TransactionFilters } from '../types'
import { generateId } from '../utils/idGenerator'
import { getNowISO } from '../utils/dateUtils'

interface TransactionState {
  transactions: Transaction[]
  initialized: boolean
  initialize: () => Promise<void>
  addTransaction: (input: TransactionInput) => Promise<Transaction>
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getFilteredTransactions: (filters: TransactionFilters) => Transaction[]
  getTransactionsByMonth: (year: number, month: number) => Transaction[]
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_transactions')
      if (stored) {
        const parsed = JSON.parse(stored) as Transaction[]
        set({ transactions: parsed, initialized: true })
      } else {
        set({ transactions: [], initialized: true })
      }
    } catch {
      set({ transactions: [], initialized: true })
    }
  },

  addTransaction: async (input: TransactionInput) => {
    const { transactions } = get()
    const now = getNowISO()

    const newTransaction: Transaction = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }

    const updated = [newTransaction, ...transactions]
    localStorage.setItem('pfm_transactions', JSON.stringify(updated))
    set({ transactions: updated })

    return newTransaction
  },

  updateTransaction: async (id: string, input: TransactionInput) => {
    const { transactions } = get()
    const now = getNowISO()

    const updated = transactions.map(tx => {
      if (tx.id === id) {
        return {
          ...tx,
          ...input,
          updatedAt: now,
        }
      }
      return tx
    })

    localStorage.setItem('pfm_transactions', JSON.stringify(updated))
    set({ transactions: updated })
  },

  deleteTransaction: async (id: string) => {
    const { transactions } = get()
    const updated = transactions.filter(tx => tx.id !== id)
    localStorage.setItem('pfm_transactions', JSON.stringify(updated))
    set({ transactions: updated })
  },

  getFilteredTransactions: (filters: TransactionFilters) => {
    const { transactions } = get()

    return transactions.filter(tx => {
      // Date range filter
      if (filters.startDate && tx.date < filters.startDate) return false
      if (filters.endDate && tx.date > filters.endDate) return false

      // Type filter
      if (filters.type && tx.type !== filters.type) return false

      // Category filter
      if (filters.categoryId && tx.categoryId !== filters.categoryId) return false

      // Subcategory filter
      if (filters.subcategoryId && tx.subcategoryId !== filters.subcategoryId) return false

      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        const noteMatch = tx.note?.toLowerCase().includes(searchLower)
        // Note: Category name matching would need category lookup
        if (!noteMatch) return false
      }

      return true
    })
  },

  getTransactionsByMonth: (year: number, month: number) => {
    const { transactions } = get()
    const monthStr = `${year}-${String(month).padStart(2, '0')}`

    return transactions.filter(tx => tx.date.startsWith(monthStr))
  },
}))
