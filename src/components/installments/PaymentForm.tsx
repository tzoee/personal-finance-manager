/**
 * PaymentForm Component
 * Modal form for adding partial payments to installments
 */

import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import type { InstallmentPaymentInput } from '../../types'
import { formatCurrency } from '../../utils/formatters'

interface PaymentFormProps {
  installmentName: string
  monthlyAmount: number
  remainingThisPeriod: number
  totalRemaining: number
  onSubmit: (input: InstallmentPaymentInput) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
}

export default function PaymentForm({
  installmentName,
  monthlyAmount,
  remainingThisPeriod,
  totalRemaining,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedAmount = parseInt(amount.replace(/[^\d]/g, ''), 10) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (parsedAmount <= 0) {
      setError('Jumlah pembayaran harus lebih dari 0')
      return
    }

    if (parsedAmount > totalRemaining) {
      setError('Jumlah pembayaran melebihi sisa cicilan')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onSubmit({
        amount: parsedAmount,
        date,
        note: note.trim() || undefined,
      })
      if (!result.success && result.error) {
        setError(result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickAmounts = [
    { label: 'Sisa periode', value: remainingThisPeriod },
    { label: '1 bulan', value: monthlyAmount },
    { label: '50%', value: Math.round(monthlyAmount / 2) },
  ].filter(q => q.value > 0 && q.value <= totalRemaining)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bayar Cicilan
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Installment Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{installmentName}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sisa periode ini:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(remainingThisPeriod)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total sisa:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(totalRemaining)}
              </span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          {quickAmounts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAmount(q.value.toString())}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    parsedAmount === q.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jumlah Pembayaran (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount ? formatCurrency(parsedAmount).replace('Rp ', '') : ''}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       text-right text-lg font-mono"
              autoFocus
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Pembayaran
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catatan (opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Pembayaran minggu ke-1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                       dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg 
                       hover:bg-primary-700 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Bayar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
