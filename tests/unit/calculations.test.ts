import { describe, it, expect } from 'vitest'
import {
  calculateMonthlySummary,
  calculateWishlistProgress,
  calculateMonthsToTarget,
  calculateInstallmentRemaining,
  calculateNetWorth,
  calculateSurplusRate,
  calculateEmergencyFundProgress,
  calculatePercentageChange,
  sortByPriority,
} from '../../src/utils/calculations'
import type { Transaction, Asset, WishlistItem } from '../../src/types'

describe('calculateMonthlySummary', () => {
  it('should calculate correct summary for mixed transactions', () => {
    const transactions: Transaction[] = [
      { id: '1', date: '2024-12-01', type: 'income', amount: 10000000, categoryId: 'c1', createdAt: '', updatedAt: '' },
      { id: '2', date: '2024-12-05', type: 'expense', amount: 3000000, categoryId: 'c2', createdAt: '', updatedAt: '' },
      { id: '3', date: '2024-12-10', type: 'expense', amount: 2000000, categoryId: 'c3', createdAt: '', updatedAt: '' },
    ]
    
    const result = calculateMonthlySummary(transactions)
    
    expect(result.totalIncome).toBe(10000000)
    expect(result.totalExpense).toBe(5000000)
    expect(result.surplus).toBe(5000000)
    expect(result.transactionCount).toBe(3)
  })

  it('should return zeros for empty transactions', () => {
    const result = calculateMonthlySummary([])
    
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(0)
    expect(result.surplus).toBe(0)
    expect(result.transactionCount).toBe(0)
  })
})

describe('calculateWishlistProgress', () => {
  it('should calculate correct progress percentage', () => {
    const item = { targetPrice: 10000000, currentSaved: 5000000 } as WishlistItem
    expect(calculateWishlistProgress(item)).toBe(50)
  })

  it('should cap progress at 100%', () => {
    const item = { targetPrice: 10000000, currentSaved: 15000000 } as WishlistItem
    expect(calculateWishlistProgress(item)).toBe(100)
  })

  it('should return 0 for zero target price', () => {
    const item = { targetPrice: 0, currentSaved: 5000000 } as WishlistItem
    expect(calculateWishlistProgress(item)).toBe(0)
  })
})

describe('calculateMonthsToTarget', () => {
  it('should calculate correct months needed', () => {
    expect(calculateMonthsToTarget(10000000, 2000000, 2000000)).toBe(4)
  })

  it('should return 0 when already reached target', () => {
    expect(calculateMonthsToTarget(10000000, 10000000, 2000000)).toBe(0)
  })

  it('should return Infinity when no monthly savings', () => {
    expect(calculateMonthsToTarget(10000000, 0, 0)).toBe(Infinity)
  })

  it('should round up to next month', () => {
    expect(calculateMonthsToTarget(10000000, 0, 3000000)).toBe(4) // 10M / 3M = 3.33 -> 4
  })
})

describe('calculateInstallmentRemaining', () => {
  it('should calculate remaining months correctly', () => {
    expect(calculateInstallmentRemaining(24, 10)).toBe(14)
  })

  it('should return 0 when completed', () => {
    expect(calculateInstallmentRemaining(24, 24)).toBe(0)
  })

  it('should return 0 when over completed', () => {
    expect(calculateInstallmentRemaining(24, 30)).toBe(0)
  })
})

describe('calculateNetWorth', () => {
  it('should calculate net worth correctly', () => {
    const assets: Asset[] = [
      { id: '1', name: 'Tabungan', type: 'savings', isLiability: false, initialValue: 10000000, currentValue: 15000000, valueHistory: [], createdAt: '', updatedAt: '' },
      { id: '2', name: 'Investasi', type: 'investment', isLiability: false, initialValue: 5000000, currentValue: 7000000, valueHistory: [], createdAt: '', updatedAt: '' },
      { id: '3', name: 'Utang', type: 'debt', isLiability: true, initialValue: 3000000, currentValue: 2000000, valueHistory: [], createdAt: '', updatedAt: '' },
    ]
    
    expect(calculateNetWorth(assets)).toBe(20000000) // 15M + 7M - 2M
  })

  it('should return 0 for empty assets', () => {
    expect(calculateNetWorth([])).toBe(0)
  })
})

describe('calculateSurplusRate', () => {
  it('should calculate surplus rate correctly', () => {
    expect(calculateSurplusRate(10000000, 7000000)).toBe(30)
  })

  it('should return 0 for zero income', () => {
    expect(calculateSurplusRate(0, 5000000)).toBe(0)
  })

  it('should handle negative surplus', () => {
    expect(calculateSurplusRate(10000000, 12000000)).toBe(-20)
  })
})

describe('calculateEmergencyFundProgress', () => {
  it('should calculate progress correctly', () => {
    const result = calculateEmergencyFundProgress(5000000, 6, 15000000)
    
    expect(result.targetAmount).toBe(30000000)
    expect(result.progress).toBe(50)
  })

  it('should cap progress at 100%', () => {
    const result = calculateEmergencyFundProgress(5000000, 6, 50000000)
    
    expect(result.progress).toBe(100)
  })
})

describe('calculatePercentageChange', () => {
  it('should calculate increase correctly', () => {
    expect(calculatePercentageChange(120, 100)).toBe(20)
  })

  it('should calculate decrease correctly', () => {
    expect(calculatePercentageChange(80, 100)).toBe(-20)
  })

  it('should handle zero previous value', () => {
    expect(calculatePercentageChange(100, 0)).toBe(100)
  })
})

describe('sortByPriority', () => {
  it('should sort items by priority (high first)', () => {
    const items = [
      { priority: 'low' as const },
      { priority: 'high' as const },
      { priority: 'medium' as const },
    ]
    
    const sorted = sortByPriority(items)
    
    expect(sorted[0].priority).toBe('high')
    expect(sorted[1].priority).toBe('medium')
    expect(sorted[2].priority).toBe('low')
  })
})
