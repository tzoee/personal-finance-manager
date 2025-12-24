/**
 * PaymentHistory Component
 * Ultra-compact, modern payment history display
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Calendar } from 'lucide-react'
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

  // Show only last 2 payments when collapsed
  const displayedPayments = isExpanded ? sortedPayments : sortedPayments.slice(0, 2)
  const hasMore = sortedPayments.length > 2

  const formatShortDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'd MMM', { locale: id })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {payments.length}x bayar
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded font-medium">
            {formatCurrency(totalPaid)}
          </span>
        </div>
        {hasMore && (
          <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </div>
        )}
      </button>

      {/* Payment List - Ultra Compact */}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {displayedPayments.map((payment) => (
          <div
            key={payment.id}
            className="inline-flex items-center gap-1 py-0.5 px-1.5 bg-gray-50 dark:bg-gray-700/40 rounded text-[10px] group/item"
            title={payment.note || formatShortDate(payment.date)}
          >
            <Check className="w-2.5 h-2.5 text-green-500" />
            <span className="text-gray-500 dark:text-gray-400">{formatShortDate(payment.date)}</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {formatCurrency(payment.amount)}
            </span>
          </div>
        ))}
        {!isExpanded && hasMore && (
          <span className="inline-flex items-center py-0.5 px-1.5 text-[10px] text-gray-400 dark:text-gray-500">
            +{sortedPayments.length - 2}
          </span>
        )}
      </div>
    </div>
  )
}
