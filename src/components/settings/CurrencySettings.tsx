/**
 * CurrencySettings Component
 * Currency format and display options
 */

import type { CurrencyDisplay } from '../../types'

interface CurrencySettingsProps {
  currency: string
  currencyDisplay: CurrencyDisplay
  onCurrencyChange: (currency: string) => void
  onDisplayChange: (display: CurrencyDisplay) => void
}

const currencies = [
  { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
]

const displayOptions: { value: CurrencyDisplay; label: string; example: string }[] = [
  { value: 'symbol', label: 'Simbol', example: 'Rp 1.000.000' },
  { value: 'code', label: 'Kode', example: 'IDR 1.000.000' },
  { value: 'name', label: 'Nama', example: '1.000.000 Rupiah' },
]

export default function CurrencySettings({
  currency,
  currencyDisplay,
  onCurrencyChange,
  onDisplayChange,
}: CurrencySettingsProps) {
  const selectedCurrency = currencies.find(c => c.code === currency)

  return (
    <div className="space-y-4">
      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mata Uang
        </label>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.symbol} - {curr.name} ({curr.code})
            </option>
          ))}
        </select>
      </div>

      {/* Display Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Format Tampilan
        </label>
        <div className="grid grid-cols-3 gap-2">
          {displayOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onDisplayChange(option.value)}
              className={`
                p-3 rounded-lg border text-center transition-all
                ${currencyDisplay === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
              `}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {option.example.replace('Rp', selectedCurrency?.symbol || 'Rp').replace('IDR', currency).replace('Rupiah', selectedCurrency?.name.split(' ')[0] || 'Rupiah')}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
