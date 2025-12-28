import { useMemo } from 'react'
import { useTransactionStore } from '../store/transactionStore'
import { useCategoryStore } from '../store/categoryStore'
import { useAssetStore } from '../store/assetStore'
import { useSettingsStore } from '../store/settingsStore'
import { useInstallmentStore } from '../store/installmentStore'
import { useMonthlyNeedStore } from '../store/monthlyNeedStore'
import type { 
  CashflowData, 
  CategoryBreakdown, 
  CategoryComparison, 
  EmergencyFundStatus, 
  Insight,
  NetWorthHistory
} from '../types'
import { 
  calculateExpenseBreakdown, 
  calculateEmergencyFundProgress,
  calculateSurplusRate 
} from '../utils/calculations'
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { getCurrentDate } from '../utils/dateUtils'

export function useDashboard() {
  const { transactions } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { assets, getNetWorth, getTotalAssets, getTotalLiabilities } = useAssetStore()
  const { settings } = useSettingsStore()
  const { installments } = useInstallmentStore()
  useMonthlyNeedStore() // Initialize store

  // Helper to get category name
  const getCategoryName = (id: string): string => {
    const category = categories.find(c => c.id === id)
    return category?.name || 'Unknown'
  }

  // Current month transactions
  const currentMonthTransactions = useMemo(() => {
    const today = parseISO(getCurrentDate())
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
    
    return transactions.filter(tx => tx.date >= monthStart && tx.date <= monthEnd)
  }, [transactions])

  // Previous month transactions
  const previousMonthTransactions = useMemo(() => {
    const today = parseISO(getCurrentDate())
    const prevMonth = subMonths(today, 1)
    const monthStart = format(startOfMonth(prevMonth), 'yyyy-MM-dd')
    const monthEnd = format(endOfMonth(prevMonth), 'yyyy-MM-dd')
    
    return transactions.filter(tx => tx.date >= monthStart && tx.date <= monthEnd)
  }, [transactions])

  // Previous month summary
  const previousMonthSummary = useMemo(() => {
    const income = previousMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
    const expense = previousMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    return { income, expense, surplus: income - expense }
  }, [previousMonthTransactions])

  // Monthly summary for current month
  const currentMonthSummary = useMemo(() => {
    const income = currentMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
    const expense = currentMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    return {
      income,
      expense,
      surplus: income - expense,
      surplusRate: calculateSurplusRate(income, expense),
    }
  }, [currentMonthTransactions])

  // Cashflow data for last 6 months
  const monthlyCashflow = useMemo((): CashflowData[] => {
    const result: CashflowData[] = []
    const today = parseISO(getCurrentDate())

    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(today, i)
      const monthKey = format(targetDate, 'yyyy-MM')
      const monthStart = format(startOfMonth(targetDate), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(targetDate), 'yyyy-MM-dd')

      const monthTx = transactions.filter(tx => tx.date >= monthStart && tx.date <= monthEnd)
      
      const income = monthTx
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0)
      const expense = monthTx
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0)

      // Calculate installment amount for this month
      // Use monthlyAmount from active installments that started before or during this month
      const installmentAmount = installments
        .filter(inst => {
          // Check if installment is active or was active during this month
          const instStartDate = inst.startDate
          // Installment applies if it started before or during this month
          return instStartDate <= monthEnd && inst.status === 'active'
        })
        .reduce((sum, inst) => sum + inst.monthlyAmount, 0)

      result.push({
        month: monthKey,
        income,
        expense,
        installment: installmentAmount,
        surplus: income - expense - installmentAmount,
      })
    }

    return result
  }, [transactions, installments])

  // Expense breakdown for current month
  const expenseBreakdown = useMemo((): CategoryBreakdown[] => {
    return calculateExpenseBreakdown(currentMonthTransactions, getCategoryName)
  }, [currentMonthTransactions, categories])

  // Top expense categories comparison (current vs previous month)
  const topExpenseCategories = useMemo((): CategoryComparison[] => {
    const currentBreakdown = calculateExpenseBreakdown(currentMonthTransactions, getCategoryName)
    const previousBreakdown = calculateExpenseBreakdown(previousMonthTransactions, getCategoryName)

    const previousMap = new Map(previousBreakdown.map(b => [b.categoryId, b.amount]))

    return currentBreakdown.slice(0, 5).map(current => {
      const previousAmount = previousMap.get(current.categoryId) || 0
      const change = current.amount - previousAmount
      const changePercentage = previousAmount > 0 
        ? ((change / previousAmount) * 100) 
        : (current.amount > 0 ? 100 : 0)

      return {
        categoryId: current.categoryId,
        categoryName: current.categoryName,
        currentMonth: current.amount,
        previousMonth: previousAmount,
        change,
        changePercentage,
      }
    })
  }, [currentMonthTransactions, previousMonthTransactions, categories])

  // Net worth
  const netWorth = useMemo(() => getNetWorth(), [assets])
  const totalAssets = useMemo(() => getTotalAssets(), [assets])
  const totalLiabilities = useMemo(() => getTotalLiabilities(), [assets])

  // Net worth history for last 6 months
  const netWorthTrend = useMemo((): NetWorthHistory[] => {
    const result: NetWorthHistory[] = []
    const today = parseISO(getCurrentDate())

    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(today, i)
      const monthEnd = endOfMonth(targetDate)
      const monthKey = format(targetDate, 'yyyy-MM')

      let monthAssets = 0
      let monthLiabilities = 0

      assets.forEach(asset => {
        // Find the latest value history entry for this month or before
        const relevantHistory = asset.valueHistory
          .filter(h => parseISO(h.date) <= monthEnd)
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())

        const value = relevantHistory.length > 0 ? relevantHistory[0].value : 0

        if (asset.isLiability) {
          monthLiabilities += value
        } else {
          monthAssets += value
        }
      })

      result.push({
        month: monthKey,
        assets: monthAssets,
        liabilities: monthLiabilities,
        netWorth: monthAssets - monthLiabilities,
      })
    }

    return result
  }, [assets])

  // Emergency fund progress
  const emergencyFundProgress = useMemo((): EmergencyFundStatus => {
    const savingsAssets = assets
      .filter(a => !a.isLiability && (a.type === 'cash' || a.type === 'savings'))
      .reduce((sum, a) => sum + a.currentValue, 0)

    return calculateEmergencyFundProgress(
      settings.monthlyLivingCost,
      settings.emergencyFundMultiplier,
      savingsAssets
    )
  }, [assets, settings])

  // Generate insights
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = []

    // Surplus rate insight
    if (currentMonthSummary.surplusRate < 0) {
      result.push({
        type: 'warning',
        message: 'Pengeluaran bulan ini melebihi pemasukan. Pertimbangkan untuk mengurangi pengeluaran.',
      })
    } else if (currentMonthSummary.surplusRate >= 20) {
      result.push({
        type: 'success',
        message: `Bagus! Tingkat tabungan bulan ini ${currentMonthSummary.surplusRate.toFixed(0)}%.`,
      })
    }

    // Emergency fund insight
    if (emergencyFundProgress.progress < 50) {
      result.push({
        type: 'warning',
        message: `Dana darurat baru ${emergencyFundProgress.progress.toFixed(0)}% dari target. Prioritaskan menabung.`,
      })
    } else if (emergencyFundProgress.progress >= 100) {
      result.push({
        type: 'success',
        message: 'Dana darurat sudah mencapai target! Pertimbangkan investasi.',
      })
    }

    // Active installments insight
    const activeInstallments = installments.filter(i => i.status === 'active')
    if (activeInstallments.length > 0) {
      const totalMonthly = activeInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0)
      result.push({
        type: 'info',
        message: `Ada ${activeInstallments.length} cicilan aktif dengan total Rp ${totalMonthly.toLocaleString('id-ID')}/bulan.`,
      })
    }

    // Expense increase insight
    const prevExpense = previousMonthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    if (prevExpense > 0 && currentMonthSummary.expense > prevExpense * 1.2) {
      const increase = ((currentMonthSummary.expense - prevExpense) / prevExpense * 100).toFixed(0)
      result.push({
        type: 'warning',
        message: `Pengeluaran naik ${increase}% dibanding bulan lalu.`,
      })
    }

    // Net worth insight
    if (netWorth < 0) {
      result.push({
        type: 'warning',
        message: 'Net worth negatif. Fokus untuk melunasi hutang.',
      })
    }

    return result
  }, [currentMonthSummary, emergencyFundProgress, installments, previousMonthTransactions, netWorth])

  return {
    // Summary
    currentMonthSummary,
    previousMonthSummary,
    netWorth,
    totalAssets,
    totalLiabilities,
    
    // Charts data
    monthlyCashflow,
    expenseBreakdown,
    topExpenseCategories,
    netWorthTrend,
    
    // Raw transactions for visualizations
    currentMonthTransactions,
    
    // Progress
    emergencyFundProgress,
    
    // Insights
    insights,
  }
}
