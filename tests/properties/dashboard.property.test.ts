import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Transaction } from '../../src/types'
import { 
  calculateExpenseBreakdown, 
  calculateSurplusRate, 
  calculateEmergencyFundProgress 
} from '../../src/utils/calculations'
import { generateId } from '../../src/utils/idGenerator'
import { getNowISO, getCurrentDate } from '../../src/utils/dateUtils'

// Helper to create transaction
function createTransaction(
  type: 'income' | 'expense',
  amount: number,
  categoryId: string
): Transaction {
  const now = getNowISO()
  return {
    id: generateId(),
    date: getCurrentDate(),
    type,
    amount,
    categoryId,
    createdAt: now,
    updatedAt: now,
  }
}

// Arbitraries - using integer for amounts to avoid float precision issues
const positiveAmountArb = fc.integer({ min: 1, max: 1000000 })
const categoryIdArb = fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0)

const expenseTransactionArb = fc.record({
  amount: positiveAmountArb,
  categoryId: categoryIdArb,
}).map(({ amount, categoryId }) => createTransaction('expense', amount, categoryId))

describe('Feature: personal-finance-manager', () => {
  describe('Property 17: Expense Breakdown Percentages', () => {
    it('should have percentages that sum to 100% for non-empty expense list', () => {
      fc.assert(
        fc.property(
          fc.array(expenseTransactionArb, { minLength: 1, maxLength: 20 }),
          (transactions) => {
            const getCategoryName = (id: string) => `Category ${id}`
            const breakdown = calculateExpenseBreakdown(transactions, getCategoryName)
            
            if (breakdown.length === 0) return true
            
            const totalPercentage = breakdown.reduce((sum, b) => sum + b.percentage, 0)
            
            // Should sum to 100% within floating point tolerance
            expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.01)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array for empty transaction list', () => {
      const getCategoryName = (id: string) => `Category ${id}`
      const breakdown = calculateExpenseBreakdown([], getCategoryName)
      expect(breakdown).toEqual([])
    })

    it('should return empty array when no expense transactions', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              amount: positiveAmountArb,
              categoryId: categoryIdArb,
            }).map(({ amount, categoryId }) => createTransaction('income', amount, categoryId)),
            { minLength: 1, maxLength: 10 }
          ),
          (incomeTransactions) => {
            const getCategoryName = (id: string) => `Category ${id}`
            const breakdown = calculateExpenseBreakdown(incomeTransactions, getCategoryName)
            expect(breakdown).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly calculate individual category percentages', () => {
      fc.assert(
        fc.property(
          fc.array(expenseTransactionArb, { minLength: 1, maxLength: 20 }),
          (transactions) => {
            const getCategoryName = (id: string) => `Category ${id}`
            const breakdown = calculateExpenseBreakdown(transactions, getCategoryName)
            
            const totalExpense = transactions.reduce((sum, tx) => sum + tx.amount, 0)
            
            breakdown.forEach(category => {
              const categoryTotal = transactions
                .filter(tx => tx.categoryId === category.categoryId)
                .reduce((sum, tx) => sum + tx.amount, 0)
              
              const expectedPercentage = (categoryTotal / totalExpense) * 100
              
              expect(Math.abs(category.percentage - expectedPercentage)).toBeLessThan(0.01)
              expect(Math.abs(category.amount - categoryTotal)).toBeLessThan(0.01)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should sort categories by amount descending', () => {
      fc.assert(
        fc.property(
          fc.array(expenseTransactionArb, { minLength: 2, maxLength: 20 }),
          (transactions) => {
            const getCategoryName = (id: string) => `Category ${id}`
            const breakdown = calculateExpenseBreakdown(transactions, getCategoryName)
            
            for (let i = 1; i < breakdown.length; i++) {
              expect(breakdown[i - 1].amount).toBeGreaterThanOrEqual(breakdown[i].amount)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 18: Surplus Rate Calculation', () => {
    it('should calculate surplus rate as ((income - expense) / income) * 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income, expense) => {
            const surplusRate = calculateSurplusRate(income, expense)
            const expected = ((income - expense) / income) * 100
            
            expect(Math.abs(surplusRate - expected)).toBeLessThan(0.01)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return 0 when income is 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (expense) => {
            const surplusRate = calculateSurplusRate(0, expense)
            expect(surplusRate).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return 100% when expense is 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (income) => {
            const surplusRate = calculateSurplusRate(income, 0)
            expect(Math.abs(surplusRate - 100)).toBeLessThan(0.01)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return negative rate when expense exceeds income', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 10000 }),
          (income, expense) => {
            const surplusRate = calculateSurplusRate(income, expense)
            expect(surplusRate).toBeLessThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return positive rate when income exceeds expense', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1001, max: 10000 }),
          fc.integer({ min: 1, max: 1000 }),
          (income, expense) => {
            const surplusRate = calculateSurplusRate(income, expense)
            expect(surplusRate).toBeGreaterThan(0)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 19: Emergency Fund Progress', () => {
    it('should calculate progress as (currentSavings / targetAmount) * 100, capped at 100%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 10000000 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 0, max: 100000000 }),
          (monthlyLivingCost, multiplier, currentSavings) => {
            const result = calculateEmergencyFundProgress(monthlyLivingCost, multiplier, currentSavings)
            
            const expectedTarget = monthlyLivingCost * multiplier
            const expectedProgress = Math.min(100, (currentSavings / expectedTarget) * 100)
            
            expect(Math.abs(result.targetAmount - expectedTarget)).toBeLessThan(0.01)
            expect(Math.abs(result.progress - expectedProgress)).toBeLessThan(0.01)
            expect(result.progress).toBeLessThanOrEqual(100)
            expect(result.progress).toBeGreaterThanOrEqual(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return correct structure with all required fields', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 10000000 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 0, max: 100000000 }),
          (monthlyLivingCost, multiplier, currentSavings) => {
            const result = calculateEmergencyFundProgress(monthlyLivingCost, multiplier, currentSavings)
            
            expect(result).toHaveProperty('monthlyLivingCost')
            expect(result).toHaveProperty('targetMultiplier')
            expect(result).toHaveProperty('targetAmount')
            expect(result).toHaveProperty('currentAmount')
            expect(result).toHaveProperty('progress')
            
            expect(result.monthlyLivingCost).toBe(monthlyLivingCost)
            expect(result.targetMultiplier).toBe(multiplier)
            expect(result.currentAmount).toBe(currentSavings)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should cap progress at 100% when savings exceed target', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 10000 }),
          fc.integer({ min: 1, max: 6 }),
          (monthlyLivingCost, multiplier) => {
            const targetAmount = monthlyLivingCost * multiplier
            const excessSavings = targetAmount * 2 // Double the target
            
            const result = calculateEmergencyFundProgress(monthlyLivingCost, multiplier, excessSavings)
            
            expect(result.progress).toBe(100)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return 0 progress when no savings', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 10000000 }),
          fc.integer({ min: 1, max: 12 }),
          (monthlyLivingCost, multiplier) => {
            const result = calculateEmergencyFundProgress(monthlyLivingCost, multiplier, 0)
            expect(result.progress).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle edge case of 0 monthly living cost', () => {
      const result = calculateEmergencyFundProgress(0, 6, 10000)
      expect(result.targetAmount).toBe(0)
      expect(result.progress).toBe(0)
    })
  })
})
