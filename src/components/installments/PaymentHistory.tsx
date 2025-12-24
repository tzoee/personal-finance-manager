/**
 * PaymentHistory Component
 * Compact, modern payment history display
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import type { InstallmentPayment } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

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

  const formatShortDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'd MMM', { locale: id })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left py-1 group"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Riwayat ({payments.length})
          </span>
          <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">
            {formatCurrency(totalPaid)}
          </span>
        </div>
        {hasMore && (
          <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </button>

      {/* Payment List - Compact */}
      <div className="mt-1.5 space-y-1">
        {displayedPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700/30 rounded text-[11px]"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {formatShortDate(payment.date)}
              </span>
              {payment.note && (
                <span className="text-gray-400 dark:text-gray-500 truncate max-w-[80px]" title={payment.note}>
                  • {payment.note}
                </span>
              )}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(payment.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {!isExpanded && hasMore && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1">
          +{sortedPayments.length - 3} lainnya
        </p>
      )}
    </div>
  )
}
