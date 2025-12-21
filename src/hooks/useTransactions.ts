/**
 * useTransactions Hook
 * Provides transaction management functionality with validation and calculations
 */

import { useCallback, useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import { useCategoryStore } from '../store/categoryStore'
import { validateTransaction } from '../utils/validators'
import type { Transaction, TransactionInput, TransactionFilters, MonthlySummary } from '../types'

export function useTransactions() {
  const {
    transactions,
    initialized,
    initialize,
    addTransaction: storeAddTransaction,
    updateTransaction: storeUpdateTransaction,
    deleteTransaction: storeDeleteTransaction,
    getFilteredTransactions,
    getTransactionsByMonth,
  } = useTransactionStore()

  const { categories, getCategoryById } = useCategoryStore()

  /**
   * Add a new transaction with validation
   */
  const addTransaction = useCallback(async (
    input: TransactionInput
  ): Promise<{ success: boolean; transaction?: Transaction; errors?: string[] }> => {
    const validation = validateTransaction(input)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => e.message),
      }
    }

    const transaction = await storeAddTransaction(input)
    return { success: true, transaction }
  }, [storeAddTransaction])

  /**
   * Update an existing transaction with validation
   */
  const updateTransaction = useCallback(async (
    id: string,
    input: TransactionInput
  ): Promise<{ success: boolean; errors?: string[] }> => {
    const validation = validateTransaction(input)
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors.map(e => e.message),
      }
    }

    await storeUpdateTransaction(id, input)
    return { success: true }
  }, [storeUpdateTransaction])

  /**
   * Delete a transaction
   */
  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    await storeDeleteTransaction(id)
  }, [storeDeleteTransaction])

  /**
   * Get monthly summary (income, expense, surplus)
   */
  const getMonthlySummary = useCallback((year: number, month: number): MonthlySummary => {
    const monthTransactions = getTransactionsByMonth(year, month)

    let totalIncome = 0
    let totalExpense = 0

    for (const tx of monthTransactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount
      }
    }

    const surplus = totalIncome - totalExpense
    const surplusRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      surplus,
      surplusRate,
      transactionCount: monthTransactions.length,
    }
  }, [getTransactionsByMonth])

  /**
   * Get current month summary
   */
  const currentMonthSummary = useMemo(() => {
    const now = new Date()
    return getMonthlySummary(now.getFullYear(), now.getMonth() + 1)
  }, [getMonthlySummary, transactions])

  /**
   * Get expense breakdown by category for a month
   */
  const getExpenseBreakdown = useCallback((year: number, month: number) => {
    const monthTransactions = getTransactionsByMonth(year, month)
    const expenses = monthTransactions.filter(tx => tx.type === 'expense')

    const breakdown: Record<string, { categoryId: string; categoryName: string; total: number; percentage: number }> = {}
    let totalExpense = 0

    for (const tx of expenses) {
      totalExpense += tx.amount
      if (!breakdown[tx.categoryId]) {
        const category = getCategoryById(tx.categoryId)
        breakdown[tx.categoryId] = {
          categoryId: tx.categoryId,
          categoryName: category?.name || 'Unknown',
          total: 0,
          percentage: 0,
        }
      }
      breakdown[tx.categoryId].total += tx.amount
    }

    // Calculate percentages
    for (const key of Object.keys(breakdown)) {
      breakdown[key].percentage = totalExpense > 0 
        ? (breakdown[key].total / totalExpense) * 100 
        : 0
    }

    return Object.values(breakdown).sort((a, b) => b.total - a.total)
  }, [getTransactionsByMonth, getCategoryById])

  /**
   * Search transactions by text
   */
  const searchTransactions = useCallback((searchText: string): Transaction[] => {
    if (!searchText.trim()) return transactions

    const searchLower = searchText.toLowerCase()
    return transactions.filter(tx => {
      // Search in note
      if (tx.note?.toLowerCase().includes(searchLower)) return true

      // Search in category name
      const category = getCategoryById(tx.categoryId)
      if (category?.name.toLowerCase().includes(searchLower)) return true

      // Search in subcategory name
      if (tx.subcategoryId && category) {
        const subcategory = category.subcategories.find(s => s.id === tx.subcategoryId)
        if (subcategory?.name.toLowerCase().includes(searchLower)) return true
      }

      return false
    })
  }, [transactions, getCategoryById])

  /**
   * Get transactions with category info
   */
  const transactionsWithCategory = useMemo(() => {
    return transactions.map(tx => {
      const category = getCategoryById(tx.categoryId)
      const subcategory = category?.subcategories.find(s => s.id === tx.subcategoryId)
      return {
        ...tx,
        categoryName: category?.name || 'Unknown',
        subcategoryName: subcategory?.name,
      }
    })
  }, [transactions, getCategoryById])

  /**
   * Get recent transactions (last N)
   */
  const getRecentTransactions = useCallback((limit: number = 10) => {
    return transactionsWithCategory.slice(0, limit)
  }, [transactionsWithCategory])

  /**
   * Filter transactions with enhanced options
   */
  const filterTransactions = useCallback((filters: TransactionFilters) => {
    let result = getFilteredTransactions(filters)

    // Add category info
    return result.map(tx => {
      const category = getCategoryById(tx.categoryId)
      const subcategory = category?.subcategories.find(s => s.id === tx.subcategoryId)
      return {
        ...tx,
        categoryName: category?.name || 'Unknown',
        subcategoryName: subcategory?.name,
      }
    })
  }, [getFilteredTransactions, getCategoryById])

  return {
    // State
    transactions,
    transactionsWithCategory,
    currentMonthSummary,
    initialized,
    categories,

    // Actions
    initialize,
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Queries
    getMonthlySummary,
    getExpenseBreakdown,
    searchTransactions,
    filterTransactions,
    getRecentTransactions,
    getTransactionsByMonth,
  }
}
