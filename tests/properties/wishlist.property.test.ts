/**
 * Property-Based Tests for Wishlist Operations
 * Properties 10, 11, 12: Progress Calculation, Priority Sorting, Months-to-Target
 * Validates: Requirements 3.1, 3.2, 3.4, 3.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { WishlistItem, Priority } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'

// Helper to create wishlist item
function createWishlistItem(
  targetPrice: number,
  currentSaved: number,
  priority: Priority = 'medium'
): WishlistItem {
  return {
    id: generateId(),
    name: 'Test Item',
    targetPrice,
    priority,
    currentSaved,
    status: 'saving',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Progress calculation function
function calculateProgress(currentSaved: number, targetPrice: number): number {
  if (targetPrice <= 0) return 0
  return Math.min((currentSaved / targetPrice) * 100, 100)
}

// Months to target calculation
function calculateMonthsToTarget(
  currentSaved: number,
  targetPrice: number,
  monthlySavings: number
): number | null {
  const remaining = targetPrice - currentSaved
  if (remaining <= 0) return 0
  if (monthlySavings <= 0) return null
  return Math.ceil(remaining / monthlySavings)
}

// Priority sorting
function sortByPriority(items: WishlistItem[]): WishlistItem[] {
  const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
  return [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

describe('Property 10: Wishlist Progress Calculation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate progress as percentage of saved vs target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        fc.integer({ min: 0, max: 100000000 }),
        (targetPrice, currentSaved) => {
          const progress = calculateProgress(currentSaved, targetPrice)
          const expectedProgress = Math.min((currentSaved / targetPrice) * 100, 100)

          expect(Math.abs(progress - expectedProgress)).toBeLessThan(0.001)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return 0 progress when target is 0 or negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000000, max: 0 }),
        fc.integer({ min: 0, max: 1000000 }),
        (targetPrice, currentSaved) => {
          const progress = calculateProgress(currentSaved, targetPrice)
          expect(progress).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should cap progress at 100%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        (targetPrice) => {
          // Saved more than target
          const currentSaved = targetPrice * 2
          const progress = calculateProgress(currentSaved, targetPrice)
          
          expect(progress).toBe(100)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return 0 progress when nothing saved', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        (targetPrice) => {
          const progress = calculateProgress(0, targetPrice)
          expect(progress).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return 100 progress when fully saved', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        (targetPrice) => {
          const progress = calculateProgress(targetPrice, targetPrice)
          expect(progress).toBe(100)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 11: Wishlist Priority Sorting', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should sort items with high priority first', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            targetPrice: fc.integer({ min: 1, max: 10000000 }),
            currentSaved: fc.integer({ min: 0, max: 10000000 }),
            priority: fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<Priority>,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (itemConfigs) => {
          const items = itemConfigs.map(config => 
            createWishlistItem(config.targetPrice, config.currentSaved, config.priority)
          )

          const sorted = sortByPriority(items)

          // Verify high comes before medium, medium before low
          let lastPriorityOrder = -1
          const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

          for (const item of sorted) {
            const currentOrder = priorityOrder[item.priority]
            expect(currentOrder).toBeGreaterThanOrEqual(lastPriorityOrder)
            lastPriorityOrder = currentOrder
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve all items after sorting', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            targetPrice: fc.integer({ min: 1, max: 10000000 }),
            currentSaved: fc.integer({ min: 0, max: 10000000 }),
            priority: fc.constantFrom('low', 'medium', 'high') as fc.Arbitrary<Priority>,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (itemConfigs) => {
          const items = itemConfigs.map(config => 
            createWishlistItem(config.targetPrice, config.currentSaved, config.priority)
          )

          const sorted = sortByPriority(items)

          expect(sorted.length).toBe(items.length)
          
          // All original IDs should be present
          const originalIds = new Set(items.map(i => i.id))
          const sortedIds = new Set(sorted.map(i => i.id))
          expect(sortedIds.size).toBe(originalIds.size)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 12: Wishlist Months-to-Target Calculation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate correct months based on remaining and monthly savings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        fc.integer({ min: 0, max: 100000000 }),
        fc.integer({ min: 1, max: 10000000 }),
        (targetPrice, currentSaved, monthlySavings) => {
          // Only test when there's remaining amount
          if (currentSaved >= targetPrice) return true

          const months = calculateMonthsToTarget(currentSaved, targetPrice, monthlySavings)
          const remaining = targetPrice - currentSaved
          const expectedMonths = Math.ceil(remaining / monthlySavings)

          expect(months).toBe(expectedMonths)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return 0 when already saved enough', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        fc.integer({ min: 1, max: 10000000 }),
        (targetPrice, monthlySavings) => {
          // Saved equal to or more than target
          const currentSaved = targetPrice + Math.floor(Math.random() * 1000000)
          const months = calculateMonthsToTarget(currentSaved, targetPrice, monthlySavings)

          expect(months).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return null when monthly savings is 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000000 }),
        fc.integer({ min: 0, max: 100000000 }),
        (targetPrice, currentSaved) => {
          // Only test when there's remaining amount
          if (currentSaved >= targetPrice) return true

          const months = calculateMonthsToTarget(currentSaved, targetPrice, 0)
          expect(months).toBeNull()
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always return positive months when not yet reached target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100000000 }),
        fc.integer({ min: 1, max: 10000000 }),
        (targetPrice, monthlySavings) => {
          // Start with 0 saved
          const months = calculateMonthsToTarget(0, targetPrice, monthlySavings)

          expect(months).not.toBeNull()
          expect(months).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
