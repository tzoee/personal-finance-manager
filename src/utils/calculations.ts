import type { Transaction, WishlistItem, Asset, MonthlySummary, CategoryBreakdown, EmergencyFundStatus } from '../types'
import { differenceInMonths, parseISO } from 'date-fns'

/**
 * Calculate monthly summary from transactions
 */
export function calculateMonthlySummary(transactions: Transaction[], year?: number, month?: number): MonthlySummary {
  let totalIncome = 0
  let totalExpense = 0

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount
    }
  }

  const surplus = totalIncome - totalExpense
  const surplusRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0

  return {
    year: year || new Date().getFullYear(),
    month: month || new Date().getMonth() + 1,
    totalIncome,
    totalExpense,
    surplus,
    surplusRate,
    transactionCount: transactions.length,
  }
}

/**
 * Calculate wishlist progress percentage
 */
export function calculateWishlistProgress(item: WishlistItem): number {
  if (item.targetPrice <= 0) return 0
  const progress = (item.currentSaved / item.targetPrice) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * Calculate months needed to reach wishlist target
 */
export function calculateMonthsToTarget(
  targetPrice: number,
  currentSaved: number,
  monthlySavings: number
): number {
  if (monthlySavings <= 0) return Infinity
  const remaining = targetPrice - currentSaved
  if (remaining <= 0) return 0
  return Math.ceil(remaining / monthlySavings)
}

/**
 * Calculate installment current month position
 */
export function calculateInstallmentCurrentMonth(startDate: string): number {
  const start = parseISO(startDate)
  const now = new Date()
  const months = differenceInMonths(now, start)
  return Math.max(1, months + 1) // 1-indexed
}

/**
 * Calculate installment remaining months
 */
export function calculateInstallmentRemaining(totalTenor: number, currentMonth: number): number {
  return Math.max(0, totalTenor - currentMonth)
}

/**
 * Calculate installment remaining amount
 */
export function calculateInstallmentRemainingAmount(
  totalTenor: number,
  currentMonth: number,
  monthlyAmount: number
): number {
  const remaining = calculateInstallmentRemaining(totalTenor, currentMonth)
  return remaining * monthlyAmount
}

/**
 * Calculate net worth from assets
 */
export function calculateNetWorth(assets: Asset[]): number {
  return assets.reduce((total, asset) => {
    if (asset.isLiability) {
      return total - asset.currentValue
    }
    return total + asset.currentValue
  }, 0)
}

/**
 * Calculate expense breakdown by category
 */
export function calculateExpenseBreakdown(
  transactions: Transaction[],
  getCategoryName: (id: string) => string
): CategoryBreakdown[] {
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense')
  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)

  if (totalExpense === 0) return []

  const categoryTotals = new Map<string, number>()

  for (const tx of expenseTransactions) {
    const current = categoryTotals.get(tx.categoryId) || 0
    categoryTotals.set(tx.categoryId, current + tx.amount)
  }

  const breakdown: CategoryBreakdown[] = []

  for (const [categoryId, amount] of categoryTotals) {
    breakdown.push({
      categoryId,
      categoryName: getCategoryName(categoryId),
      amount,
      percentage: (amount / totalExpense) * 100,
    })
  }

  // Sort by amount descending
  return breakdown.sort((a, b) => b.amount - a.amount)
}

/**
 * Calculate surplus rate percentage
 */
export function calculateSurplusRate(income: number, expense: number): number {
  if (income <= 0) return 0
  return ((income - expense) / income) * 100
}

/**
 * Calculate emergency fund progress
 */
export function calculateEmergencyFundProgress(
  monthlyLivingCost: number,
  multiplier: number,
  currentSavings: number
): EmergencyFundStatus {
  const targetAmount = monthlyLivingCost * multiplier
  const progress = targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0

  return {
    monthlyLivingCost,
    targetMultiplier: multiplier,
    targetAmount,
    currentAmount: currentSavings,
    progress,
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}

/**
 * Sort wishlist items by priority
 */
export function sortByPriority<T extends { priority: 'low' | 'medium' | 'high' }>(items: T[]): T[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}
