/**
 * PaymentHistory Component
 * Displays payment history for an installment
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Receipt, Calendar } from 'lucide-react'
import type { InstallmentPayment } from '../../types'
import { formatCurrency, formatDate } from '../../utils/formatters'

interface PaymentHistoryProps {
  payments: InstallmentPayment[]
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (payments.length === 0) {
    return null
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Show only last 3 payments when collapsed
  const displayedPayments = isExpanded ? sortedPayments : sortedPayments.slice(0, 3)
  const hasMore = sortedPayments.length > 3

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Riwayat Pembayaran ({payments.length})
          </span>
        </div>
        {hasMore && (
          isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )
        )}
      </button>

      <div className="space-y-2">
        {displayedPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(payment.date)}
                  {payment.note && ` • ${payment.note}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Total dibayar:</span>
        <span className="font-medium text-green-600 dark:text-green-400">
          {formatCurrency(totalPaid)}
        </span>
      </div>
    </div>
  )
}
