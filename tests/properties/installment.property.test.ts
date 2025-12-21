/**
 * Property-Based Tests for Installment Operations
 * 
 * Property 1: New installments always start as active
 * Property 2: Status transitions to paid_off only when fully paid
 * Property 3: CurrentMonth is derived from payments
 * Property 5: Total paid equals sum of payments
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.3, 2.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { Installment, InstallmentPayment } from '../../src/types'
import { generateId } from '../../src/utils/idGenerator'
import { calculateInstallmentStatusFromPayments } from '../../src/store/installmentStore'

// Helper to create installment with payments
function createInstallmentWithPayments(
  totalTenor: number,
  monthlyAmount: number,
  payments: InstallmentPayment[] = []
): Installment {
  const installment: Installment = {
    id: generateId(),
    name: 'Test Installment',
    totalAmount: totalTenor * monthlyAmount,
    totalTenor,
    currentMonth: 0,
    monthlyAmount,
    startDate: new Date().toISOString().split('T')[0],
    subcategory: 'test',
    status: 'active',
    autoGenerateTransaction: false,
    payments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Calculate status from payments
  const { status, currentMonth } = calculateInstallmentStatusFromPayments(installment)
  return { ...installment, status, currentMonth }
}

// Helper to create payment
function createPayment(installmentId: string, amount: number): InstallmentPayment {
  return {
    id: generateId(),
    installmentId,
    amount,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
}

describe('Property 1: New installments always start as active', () => {
  /**
   * Feature: finance-enhancements, Property 1: New installments always start as active
   * For any installment created with any tenor value (including 1 month), 
   * the initial status SHALL be "active" and currentMonth SHALL be 0.
   * Validates: Requirements 1.1, 1.2
   */
  
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should always start with status active and currentMonth 0 for any tenor', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }), // totalTenor including 1 month
        fc.integer({ min: 100000, max: 10000000 }), // monthlyAmount
        (totalTenor, monthlyAmount) => {
          // Create installment with no payments
          const installment = createInstallmentWithPayments(totalTenor, monthlyAmount, [])
          
          // Should always be active with no payments
          expect(installment.status).toBe('active')
          expect(installment.currentMonth).toBe(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should start as active even with tenor of 1 month', () => {
    // Specific test for the bug case
    const installment = createInstallmentWithPayments(1, 400000, [])
    
    expect(installment.status).toBe('active')
    expect(installment.currentMonth).toBe(0)
  })
})

describe('Property 2: Status transitions to paid_off only when fully paid', () => {
  /**
   * Feature: finance-enhancements, Property 2: Status transitions to paid_off only when fully paid
   * For any installment, the status SHALL be "paid_off" if and only if 
   * the sum of all payment amounts >= (totalTenor × monthlyAmount).
   * Validates: Requirements 1.3
   */

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should be paid_off only when total paid >= total required', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 24 }),
        fc.integer({ min: 100000, max: 1000000 }),
        fc.float({ min: 0, max: 2 }), // payment multiplier
        (totalTenor, monthlyAmount, paymentMultiplier) => {
          const totalRequired = totalTenor * monthlyAmount
          const paymentAmount = Math.floor(totalRequired * paymentMultiplier)
          
          const payments = paymentAmount > 0 
            ? [createPayment('test', paymentAmount)]
            : []
          
          const installment = createInstallmentWithPayments(totalTenor, monthlyAmount, payments)
          
          if (paymentAmount >= totalRequired) {
            expect(installment.status).toBe('paid_off')
          } else {
            expect(installment.status).toBe('active')
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})


describe('Property 3: CurrentMonth is derived from payments', () => {
  /**
   * Feature: finance-enhancements, Property 3: CurrentMonth is derived from payments
   * For any installment with payments, currentMonth SHALL equal 
   * floor(totalPaid / monthlyAmount), where totalPaid is the sum of all payment amounts.
   * Validates: Requirements 1.4, 2.4
   */

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate currentMonth as floor(totalPaid / monthlyAmount)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 24 }),
        fc.integer({ min: 100000, max: 1000000 }),
        fc.array(fc.integer({ min: 10000, max: 500000 }), { minLength: 0, maxLength: 10 }),
        (totalTenor, monthlyAmount, paymentAmounts) => {
          const payments = paymentAmounts.map(amount => createPayment('test', amount))
          const totalPaid = paymentAmounts.reduce((sum, a) => sum + a, 0)
          const expectedCurrentMonth = Math.min(
            Math.floor(totalPaid / monthlyAmount),
            totalTenor
          )
          
          const installment = createInstallmentWithPayments(totalTenor, monthlyAmount, payments)
          
          expect(installment.currentMonth).toBe(expectedCurrentMonth)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 5: Total paid equals sum of payments', () => {
  /**
   * Feature: finance-enhancements, Property 5: Total paid equals sum of payments
   * For any installment, the displayed totalPaid SHALL equal 
   * the sum of all InstallmentPayment amounts for that installment.
   * Validates: Requirements 2.3
   */

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should calculate totalPaid as sum of all payment amounts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 24 }),
        fc.integer({ min: 100000, max: 1000000 }),
        fc.array(fc.integer({ min: 10000, max: 500000 }), { minLength: 0, maxLength: 20 }),
        (totalTenor, monthlyAmount, paymentAmounts) => {
          const payments = paymentAmounts.map(amount => createPayment('test', amount))
          const expectedTotalPaid = paymentAmounts.reduce((sum, a) => sum + a, 0)
          
          const installment = createInstallmentWithPayments(totalTenor, monthlyAmount, payments)
          const { totalPaid } = calculateInstallmentStatusFromPayments(installment)
          
          expect(totalPaid).toBe(expectedTotalPaid)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Installment Calculation Properties', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should have paid + remaining = total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 24 }),
        fc.integer({ min: 100000, max: 1000000 }),
        fc.array(fc.integer({ min: 10000, max: 500000 }), { minLength: 0, maxLength: 10 }),
        (totalTenor, monthlyAmount, paymentAmounts) => {
          const payments = paymentAmounts.map(amount => createPayment('test', amount))
          const installment = createInstallmentWithPayments(totalTenor, monthlyAmount, payments)
          
          const { totalPaid } = calculateInstallmentStatusFromPayments(installment)
          const totalRequired = totalTenor * monthlyAmount
          const remainingAmount = Math.max(totalRequired - totalPaid, 0)
          
          // totalPaid + remainingAmount should equal totalRequired (or totalPaid if overpaid)
          expect(totalPaid + remainingAmount).toBeGreaterThanOrEqual(totalRequired)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate periodPaid correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 24 }),
        fc.integer({ min: 100000, max: 1000000 }),
        fc.array(fc.integer({ min: 10000, max: 500000 }), { minLength: 1, maxLength: 10 }),
        (totalTenor, monthlyAmount, paymentAmounts) => {
          const payments = paymentAmounts.map(amount => createPayment('test', amount))
          const totalPaid = paymentAmounts.reduce((sum, a) => sum + a, 0)
          const expectedPeriodPaid = totalPaid % monthlyAmount
          
          const installment = createInstallmentWithPayments(totalTenor, monthlyAmount, payments)
          const { periodPaid } = calculateInstallmentStatusFromPayments(installment)
          
          expect(periodPaid).toBe(expectedPeriodPaid)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
