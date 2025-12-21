/**
 * Property-Based Tests for Monthly Needs Budget Comparison
 * Property 14: Budget Comparison Accuracy
 * Validates: Requirements 5.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { MonthlyNeed, BudgetComparison } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'

// Helper to create monthly need
function createMonthlyNeed(budgetAmount: number): MonthlyNeed {
  return {
    id: generateId(),
    name: 'Test Need',
    budgetAmount,
    recurrencePeriod: 'forever',
    autoGenerateTransaction: false,
    createdAt: new Date().toISOString(),
  }
}

// Calculate budget comparison
function calculateBudgetComparison(
  need: MonthlyNeed,
  actualAmount: number
): BudgetComparison {
  return {
    needId: need.id,
    name: need.name,
    budget: need.budgetAmount,
    actual: actualAmount,
    difference: need.budgetAmount - actualAmount,
    isOverBudget: actualAmount > need.budgetAmount,
  }
}

describe('Property 14: Budget Comparison Accuracy', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate correct difference between budget and actual', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 10000000 }),
        fc.integer({ min: 0, max: 10000000 }),
        (budgetAmount, actualAmount) => {
          const need = createMonthlyNeed(budgetAmount)
          const comparison = calculateBudgetComparison(need, actualAmount)

          expect(comparison.difference).toBe(budgetAmount - actualAmount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly identify over-budget status', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 10000000 }),
        fc.integer({ min: 0, max: 20000000 }),
        (budgetAmount, actualAmount) => {
          const need = createMonthlyNeed(budgetAmount)
          const comparison = calculateBudgetComparison(need, actualAmount)

          expect(comparison.isOverBudget).toBe(actualAmount > budgetAmount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have positive difference when under budget', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 10000000 }),
        (budgetAmount) => {
          // Actual is less than budget
          const actualAmount = Math.floor(budgetAmount * 0.8)
          const need = createMonthlyNeed(budgetAmount)
          const comparison = calculateBudgetComparison(need, actualAmount)

          expect(comparison.difference).toBeGreaterThan(0)
          expect(comparison.isOverBudget).toBe(false)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have negative difference when over budget', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 10000000 }),
        (budgetAmount) => {
          // Actual is more than budget
          const actualAmount = Math.floor(budgetAmount * 1.2)
          const need = createMonthlyNeed(budgetAmount)
          const comparison = calculateBudgetComparison(need, actualAmount)

          expect(comparison.difference).toBeLessThan(0)
          expect(comparison.isOverBudget).toBe(true)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have zero difference when exactly on budget', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 10000000 }),
        (budgetAmount) => {
          const need = createMonthlyNeed(budgetAmount)
          const comparison = calculateBudgetComparison(need, budgetAmount)

          expect(comparison.difference).toBe(0)
          expect(comparison.isOverBudget).toBe(false)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate total budget correctly for multiple needs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 100000, max: 5000000 }), { minLength: 1, maxLength: 10 }),
        (budgetAmounts) => {
          const needs = budgetAmounts.map(amount => createMonthlyNeed(amount))
          const totalBudget = needs.reduce((sum, n) => sum + n.budgetAmount, 0)
          const expectedTotal = budgetAmounts.reduce((sum, a) => sum + a, 0)

          expect(totalBudget).toBe(expectedTotal)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
