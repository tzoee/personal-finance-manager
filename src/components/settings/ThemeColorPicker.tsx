/**
 * ThemeColorPicker Component
 * Color picker for theme customization
 */

import { Check } from 'lucide-react'
import type { ThemeColor } from '../../types'

interface ThemeColorPickerProps {
  value: ThemeColor
  onChange: (color: ThemeColor) => void
}

const themeColors: { id: ThemeColor; name: string; color: string; ring: string }[] = [
  { id: 'blue', name: 'Biru', color: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'green', name: 'Hijau', color: 'bg-green-500', ring: 'ring-green-500' },
  { id: 'purple', name: 'Ungu', color: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'orange', name: 'Oranye', color: 'bg-orange-500', ring: 'ring-orange-500' },
  { id: 'pink', name: 'Pink', color: 'bg-pink-500', ring: 'ring-pink-500' },
  { id: 'teal', name: 'Teal', color: 'bg-teal-500', ring: 'ring-teal-500' },
]

export default function ThemeColorPicker({ value, onChange }: ThemeColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Warna Tema
      </label>
      <div className="flex flex-wrap gap-3">
        {themeColors.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`
              relative w-10 h-10 rounded-full ${theme.color} 
              transition-transform hover:scale-110 
              ${value === theme.id ? `ring-2 ring-offset-2 ${theme.ring}` : ''}
            `}
            title={theme.name}
          >
            {value === theme.id && (
              <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Pilih warna utama untuk tampilan aplikasi
      </p>
    </div>
  )
}
