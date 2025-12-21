/**
 * Property Tests for Monthly Needs Recurrence
 * Tests the recurrence period logic for monthly needs
 */

import { describe, it, expect } from 'vitest'
import { shouldShowForMonth } from '../../src/store/monthlyNeedStore'
import type { MonthlyNeed } from '../../src/types'

// Helper to create a test need
function createTestNeed(overrides: Partial<MonthlyNeed> = {}): MonthlyNeed {
  return {
    id: 'test-1',
    name: 'Test Need',
    budgetAmount: 100000,
    recurrencePeriod: 'forever',
    startMonth: '2024-01',
    autoGenerateTransaction: false,
    createdAt: '2024-01-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('Property 7: Monthly recurrence shows for exactly 12 months', () => {
  it('should show for months 0-11 from start', () => {
    const need = createTestNeed({
      recurrencePeriod: 'monthly',
      startMonth: '2024-01',
    })

    // Should show for first 12 months
    expect(shouldShowForMonth(need, '2024-01')).toBe(true) // Month 0
    expect(shouldShowForMonth(need, '2024-06')).toBe(true) // Month 5
    expect(shouldShowForMonth(need, '2024-12')).toBe(true) // Month 11
  })

  it('should NOT show after 12 months', () => {
    const need = createTestNeed({
      recurrencePeriod: 'monthly',
      startMonth: '2024-01',
    })

    // Should NOT show after 12 months
    expect(shouldShowForMonth(need, '2025-01')).toBe(false) // Month 12
    expect(shouldShowForMonth(need, '2025-06')).toBe(false) // Month 17
  })

  it('should NOT show before start month', () => {
    const need = createTestNeed({
      recurrencePeriod: 'monthly',
      startMonth: '2024-06',
    })

    expect(shouldShowForMonth(need, '2024-01')).toBe(false)
    expect(shouldShowForMonth(need, '2024-05')).toBe(false)
  })
})

describe('Property 8: Yearly recurrence shows only on same month', () => {
  it('should show only on the same month each year', () => {
    const need = createTestNeed({
      recurrencePeriod: 'yearly',
      startMonth: '2024-03', // March
    })

    // Should show on March of any year
    expect(shouldShowForMonth(need, '2024-03')).toBe(true)
    expect(shouldShowForMonth(need, '2025-03')).toBe(true)
    expect(shouldShowForMonth(need, '2030-03')).toBe(true)
  })

  it('should NOT show on other months', () => {
    const need = createTestNeed({
      recurrencePeriod: 'yearly',
      startMonth: '2024-03', // March
    })

    // Should NOT show on other months
    expect(shouldShowForMonth(need, '2024-01')).toBe(false)
    expect(shouldShowForMonth(need, '2024-02')).toBe(false)
    expect(shouldShowForMonth(need, '2024-04')).toBe(false)
    expect(shouldShowForMonth(need, '2025-01')).toBe(false)
  })

  it('should NOT show before start month', () => {
    const need = createTestNeed({
      recurrencePeriod: 'yearly',
      startMonth: '2024-06',
    })

    // Same month but before start year
    expect(shouldShowForMonth(need, '2023-06')).toBe(false)
  })
})

describe('Property 9: Forever recurrence shows for all future months', () => {
  it('should show for any month from start onwards', () => {
    const need = createTestNeed({
      recurrencePeriod: 'forever',
      startMonth: '2024-01',
    })

    expect(shouldShowForMonth(need, '2024-01')).toBe(true)
    expect(shouldShowForMonth(need, '2024-06')).toBe(true)
    expect(shouldShowForMonth(need, '2025-01')).toBe(true)
    expect(shouldShowForMonth(need, '2030-12')).toBe(true)
    expect(shouldShowForMonth(need, '2050-06')).toBe(true)
  })

  it('should NOT show before start month', () => {
    const need = createTestNeed({
      recurrencePeriod: 'forever',
      startMonth: '2024-06',
    })

    expect(shouldShowForMonth(need, '2024-01')).toBe(false)
    expect(shouldShowForMonth(need, '2024-05')).toBe(false)
    expect(shouldShowForMonth(need, '2023-12')).toBe(false)
  })

  it('should default to forever when recurrencePeriod is undefined', () => {
    const need = createTestNeed({
      recurrencePeriod: undefined as any,
      startMonth: '2024-01',
    })

    expect(shouldShowForMonth(need, '2024-01')).toBe(true)
    expect(shouldShowForMonth(need, '2030-12')).toBe(true)
  })
})

describe('Edge Cases', () => {
  it('should handle year boundary correctly for monthly', () => {
    const need = createTestNeed({
      recurrencePeriod: 'monthly',
      startMonth: '2024-06', // June 2024
    })

    // 12 months from June 2024 = May 2025
    expect(shouldShowForMonth(need, '2024-06')).toBe(true) // Month 0
    expect(shouldShowForMonth(need, '2024-12')).toBe(true) // Month 6
    expect(shouldShowForMonth(need, '2025-01')).toBe(true) // Month 7
    expect(shouldShowForMonth(need, '2025-05')).toBe(true) // Month 11
    expect(shouldShowForMonth(need, '2025-06')).toBe(false) // Month 12 - should NOT show
  })

  it('should use createdAt as fallback when startMonth is undefined', () => {
    const need = createTestNeed({
      recurrencePeriod: 'monthly',
      startMonth: undefined,
      createdAt: '2024-03-15T00:00:00.000Z', // March 2024
    })

    expect(shouldShowForMonth(need, '2024-03')).toBe(true)
    expect(shouldShowForMonth(need, '2024-02')).toBe(false)
  })
})
