import { create } from 'zustand'
import type { AppSettings } from '../types'

interface SettingsState {
  settings: AppSettings
  darkMode: boolean
  initialized: boolean
  initialize: () => Promise<void>
  setDarkMode: (enabled: boolean) => void
  updateSettings: (settings: Partial<AppSettings>) => void
}

const defaultSettings: AppSettings = {
  currency: 'IDR',
  monthlyLivingCost: 5000000,
  emergencyFundMultiplier: 6,
  darkMode: false,
  schemaVersion: 1,
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
        set({
          settings: { ...defaultSettings, ...parsed },
          darkMode: parsed.darkMode ?? false,
          initialized: true,
        })
      } else {
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

  updateSettings: (updates: Partial<AppSettings>) => {
    const { settings } = get()
    const newSettings = { ...settings, ...updates }
    localStorage.setItem('pfm_settings', JSON.stringify(newSettings))
    set({ settings: newSettings, darkMode: newSettings.darkMode })
  },
}))
