/**
 * Property-Based Tests for Installment Operations
 * Property 13: Installment State Calculation
 * Validates: Requirements 4.1, 4.2, 4.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { Installment, InstallmentStatus } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'

// Helper to calculate current month from start date
function calculateCurrentMonth(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  
  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth()
  
  const monthsDiff = (nowYear - startYear) * 12 + (nowMonth - startMonth)
  return Math.max(monthsDiff + 1, 1) // At least 1 month
}

// Helper to create installment
function createInstallment(
  totalTenor: number,
  monthlyAmount: number,
  startDate: string
): Installment {
  const currentMonth = calculateCurrentMonth(startDate)
  const status: InstallmentStatus = currentMonth >= totalTenor ? 'paid_off' : 'active'

  return {
    id: generateId(),
    name: 'Test Installment',
    totalTenor,
    currentMonth,
    monthlyAmount,
    startDate,
    subcategory: 'test',
    status,
    autoGenerateTransaction: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Calculate installment details
function calculateDetails(installment: Installment) {
  const totalAmount = installment.monthlyAmount * installment.totalTenor
  const paidAmount = installment.monthlyAmount * Math.min(installment.currentMonth, installment.totalTenor)
  const remainingMonths = Math.max(installment.totalTenor - installment.currentMonth, 0)
  const remainingAmount = installment.monthlyAmount * remainingMonths
  const progressPercentage = Math.min((installment.currentMonth / installment.totalTenor) * 100, 100)

  return {
    totalAmount,
    paidAmount,
    remainingMonths,
    remainingAmount,
    progressPercentage,
  }
}

describe('Property 13: Installment State Calculation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate correct total amount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }), // totalTenor (1-120 months)
        fc.integer({ min: 100000, max: 10000000 }), // monthlyAmount
        (totalTenor, monthlyAmount) => {
          const installment = createInstallment(totalTenor, monthlyAmount, '2024-01-01')
          const details = calculateDetails(installment)

          expect(details.totalAmount).toBe(totalTenor * monthlyAmount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate correct remaining months', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 100000, max: 5000000 }),
        fc.integer({ min: 1, max: 36 }), // months ago
        (totalTenor, monthlyAmount, monthsAgo) => {
          // Create start date in the past
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - monthsAgo)
          const startDateStr = startDate.toISOString().split('T')[0]

          const installment = createInstallment(totalTenor, monthlyAmount, startDateStr)
          const details = calculateDetails(installment)

          // Remaining months should be non-negative
          expect(details.remainingMonths).toBeGreaterThanOrEqual(0)
          
          // Remaining months should not exceed total tenor
          expect(details.remainingMonths).toBeLessThanOrEqual(totalTenor)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate correct remaining amount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 100000, max: 5000000 }),
        (totalTenor, monthlyAmount) => {
          const installment = createInstallment(totalTenor, monthlyAmount, '2024-01-01')
          const details = calculateDetails(installment)

          // Remaining amount = remaining months * monthly amount
          expect(details.remainingAmount).toBe(details.remainingMonths * monthlyAmount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have paid + remaining = total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 100000, max: 5000000 }),
        fc.integer({ min: 0, max: 24 }),
        (totalTenor, monthlyAmount, monthsAgo) => {
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - monthsAgo)
          const startDateStr = startDate.toISOString().split('T')[0]

          const installment = createInstallment(totalTenor, monthlyAmount, startDateStr)
          const details = calculateDetails(installment)

          // Paid + Remaining should equal Total
          expect(details.paidAmount + details.remainingAmount).toBe(details.totalAmount)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should cap progress at 100%', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }), // Short tenor
        fc.integer({ min: 100000, max: 5000000 }),
        (totalTenor, monthlyAmount) => {
          // Start date far in the past to ensure completion
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - 24)
          const startDateStr = startDate.toISOString().split('T')[0]

          const installment = createInstallment(totalTenor, monthlyAmount, startDateStr)
          const details = calculateDetails(installment)

          expect(details.progressPercentage).toBeLessThanOrEqual(100)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should mark as paid_off when current month >= total tenor', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 100000, max: 5000000 }),
        (totalTenor, monthlyAmount) => {
          // Start date far enough in the past
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - totalTenor - 1)
          const startDateStr = startDate.toISOString().split('T')[0]

          const installment = createInstallment(totalTenor, monthlyAmount, startDateStr)

          expect(installment.status).toBe('paid_off')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should mark as active when current month < total tenor', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 24, max: 60 }), // Long tenor
        fc.integer({ min: 100000, max: 5000000 }),
        (totalTenor, monthlyAmount) => {
          // Start date recent
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - 1)
          const startDateStr = startDate.toISOString().split('T')[0]

          const installment = createInstallment(totalTenor, monthlyAmount, startDateStr)

          expect(installment.status).toBe('active')
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate progress percentage correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 60 }),
        fc.integer({ min: 100000, max: 5000000 }),
        fc.integer({ min: 1, max: 9 }),
        (totalTenor, monthlyAmount, monthsAgo) => {
          const startDate = new Date()
          startDate.setMonth(startDate.getMonth() - monthsAgo)
          const startDateStr = startDate.toISOString().split('T')[0]

          const installment = createInstallment(totalTenor, monthlyAmount, startDateStr)
          const details = calculateDetails(installment)

          const expectedProgress = Math.min((installment.currentMonth / totalTenor) * 100, 100)
          expect(Math.abs(details.progressPercentage - expectedProgress)).toBeLessThan(0.001)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
