/**
 * Property Tests for Savings Calculations
 * Tests the savings goal and deposit calculations
 * 
 * **Validates: Requirements 4.3, 4.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateTotalSaved, calculateProgress } from '../../src/store/savingsStore'
import type { SavingsDeposit } from '../../src/types'

// Arbitrary for generating deposits
const depositArb = fc.record({
  id: fc.uuid(),
  savingsId: fc.uuid(),
  amount: fc.integer({ min: 1000, max: 100000000 }),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map(d => d.toISOString().split('T')[0]),
  note: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
  createdAt: fc.date().map(d => d.toISOString()),
})

const depositsArb = fc.array(depositArb, { minLength: 0, maxLength: 20 })

describe('Property 10: Savings total equals sum of deposits', () => {
  it('should calculate totalSaved as sum of all deposit amounts', () => {
    fc.assert(
      fc.property(depositsArb, (deposits) => {
        const expectedTotal = deposits.reduce((sum, d) => sum + d.amount, 0)
        const actualTotal = calculateTotalSaved(deposits as SavingsDeposit[])
        
        expect(actualTotal).toBe(expectedTotal)
      }),
      { numRuns: 100 }
    )
  })

  it('should return 0 for empty deposits', () => {
    expect(calculateTotalSaved([])).toBe(0)
  })

  it('should handle single deposit correctly', () => {
    fc.assert(
      fc.property(depositArb, (deposit) => {
        const total = calculateTotalSaved([deposit as SavingsDeposit])
        expect(total).toBe(deposit.amount)
      }),
      { numRuns: 100 }
    )
  })
})

describe('Progress Calculation Properties', () => {
  it('should calculate progress as (totalSaved / targetAmount) * 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000000 }),
        fc.integer({ min: 1, max: 100000000 }),
        (totalSaved, targetAmount) => {
          const progress = calculateProgress(totalSaved, targetAmount)
          const expected = Math.min(100, (totalSaved / targetAmount) * 100)
          
          expect(progress).toBeCloseTo(expected, 5)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should cap progress at 100%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        (targetAmount) => {
          // Total saved is more than target
          const totalSaved = targetAmount * 2
          const progress = calculateProgress(totalSaved, targetAmount)
          
          expect(progress).toBe(100)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return 0 for zero target amount', () => {
    expect(calculateProgress(50000, 0)).toBe(0)
  })

  it('should return 0 for negative target amount', () => {
    expect(calculateProgress(50000, -10000)).toBe(0)
  })

  it('progress should be between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000000 }),
        fc.integer({ min: 1, max: 100000000 }),
        (totalSaved, targetAmount) => {
          const progress = calculateProgress(totalSaved, targetAmount)
          
          expect(progress).toBeGreaterThanOrEqual(0)
          expect(progress).toBeLessThanOrEqual(100)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Savings Invariants', () => {
  it('total saved should be non-negative', () => {
    fc.assert(
      fc.property(depositsArb, (deposits) => {
        const total = calculateTotalSaved(deposits as SavingsDeposit[])
        expect(total).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 100 }
    )
  })

  it('adding a deposit should increase total', () => {
    fc.assert(
      fc.property(
        depositsArb,
        depositArb,
        (existingDeposits, newDeposit) => {
          const totalBefore = calculateTotalSaved(existingDeposits as SavingsDeposit[])
          const totalAfter = calculateTotalSaved([...existingDeposits, newDeposit] as SavingsDeposit[])
          
          expect(totalAfter).toBe(totalBefore + newDeposit.amount)
        }
      ),
      { numRuns: 100 }
    )
  })
})
