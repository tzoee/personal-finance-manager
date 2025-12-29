import { create } from 'zustand'
import type { AppSettings, ThemeColor } from '../types'

interface SettingsState {
  settings: AppSettings
  darkMode: boolean
  initialized: boolean
  initialize: () => Promise<void>
  setDarkMode: (enabled: boolean) => void
  setThemeColor: (color: ThemeColor) => void
  setCompactMode: (enabled: boolean) => void
  updateSettings: (settings: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  currency: 'IDR',
  currencyDisplay: 'symbol',
  monthlyLivingCost: 5000000,
  emergencyFundMultiplier: 6,
  darkMode: false,
  themeColor: 'blue',
  compactMode: false,
  userName: '',
  userAvatar: '',
  schemaVersion: 1,
}

// Apply theme color to CSS variables
const applyThemeColor = (color: ThemeColor) => {
  const colors: Record<ThemeColor, { primary: string; primaryDark: string }> = {
    blue: { primary: '59, 130, 246', primaryDark: '37, 99, 235' },
    green: { primary: '34, 197, 94', primaryDark: '22, 163, 74' },
    purple: { primary: '168, 85, 247', primaryDark: '147, 51, 234' },
    orange: { primary: '249, 115, 22', primaryDark: '234, 88, 12' },
    pink: { primary: '236, 72, 153', primaryDark: '219, 39, 119' },
    teal: { primary: '20, 184, 166', primaryDark: '13, 148, 136' },
  }
  
  const { primary, primaryDark } = colors[color]
  document.documentElement.style.setProperty('--color-primary', primary)
  document.documentElement.style.setProperty('--color-primary-dark', primaryDark)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  darkMode: false,
  initialized: false,

  initialize: async () => {
    try {
      const stored = localStorage.getItem('pfm_settings')
      if (stored) {
        const parsed = JSON.parse(stored) as AppSettings
        const mergedSettings = { ...defaultSettings, ...parsed }
        
        // Apply theme color on init
        applyThemeColor(mergedSettings.themeColor || 'blue')
        
        // Apply compact mode
        if (mergedSettings.compactMode) {
          document.documentElement.classList.add('compact')
        }
        
        set({
          settings: mergedSettings,
          darkMode: parsed.darkMode ?? false,
          initialized: true,
        })
      } else {
        applyThemeColor('blue')
        set({ initialized: true })
      }
    } catch {
      set({ initialized: true })
    }
  },

  setDarkMode: (enabled: boolean) => {
    const { settings } = get()
    const newSettings = { ...settings, darkMode: enabled }
    localStorage.setItem('pfm_settings', JSON.stringify(newSettings))
    set({ darkMode: enabled, settings: newSettings })
  },

  setThemeColor: (color: ThemeColor) => {
    const { settings } = get()
    const newSettings = { ...settings, themeColor: color }
    localStorage.setItem('pfm_settings', JSON.stringify(newSettings))
    applyThemeColor(color)
    set({ settings: newSettings })
  },

  setCompactMode: (enabled: boolean) => {
    const { settings } = get()
    const newSettings = { ...settings, compactMode: enabled }
    localStorage.setItem('pfm_settings', JSON.stringify(newSettings))
    
    if (enabled) {
      document.documentElement.classList.add('compact')
    } else {
      document.documentElement.classList.remove('compact')
    }
    
    set({ settings: newSettings })
  },

  updateSettings: (updates: Partial<AppSettings>) => {
    const { settings } = get()
    const newSettings = { ...settings, ...updates }
    localStorage.setItem('pfm_settings', JSON.stringify(newSettings))
    
    // Apply theme if changed
    if (updates.themeColor) {
      applyThemeColor(updates.themeColor)
    }
    
    // Apply compact mode if changed
    if (updates.compactMode !== undefined) {
      if (updates.compactMode) {
        document.documentElement.classList.add('compact')
      } else {
        document.documentElement.classList.remove('compact')
      }
    }
    
    set({ settings: newSettings, darkMode: newSettings.darkMode })
  },
}))
