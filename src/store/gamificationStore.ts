import { create } from 'zustand'
import type { Achievement, UserProgress } from '../types'

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Transaction milestones
  { id: 'first_transaction', name: 'Langkah Pertama', description: 'Catat transaksi pertama', icon: '🎯', category: 'transactions', requirement: 1 },
  { id: 'transactions_10', name: 'Pencatat Pemula', description: 'Catat 10 transaksi', icon: '📝', category: 'transactions', requirement: 10 },
  { id: 'transactions_50', name: 'Pencatat Rajin', description: 'Catat 50 transaksi', icon: '📊', category: 'transactions', requirement: 50 },
  { id: 'transactions_100', name: 'Pencatat Handal', description: 'Catat 100 transaksi', icon: '🏆', category: 'transactions', requirement: 100 },
  { id: 'transactions_500', name: 'Master Pencatat', description: 'Catat 500 transaksi', icon: '👑', category: 'transactions', requirement: 500 },
  
  // Streak achievements
  { id: 'streak_3', name: 'Konsisten', description: '3 hari berturut-turut mencatat', icon: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak_7', name: 'Seminggu Penuh', description: '7 hari berturut-turut mencatat', icon: '⚡', category: 'streak', requirement: 7 },
  { id: 'streak_30', name: 'Sebulan Penuh', description: '30 hari berturut-turut mencatat', icon: '💪', category: 'streak', requirement: 30 },
  { id: 'streak_100', name: 'Legenda', description: '100 hari berturut-turut mencatat', icon: '🌟', category: 'streak', requirement: 100 },
  
  // Savings milestones
  { id: 'savings_1m', name: 'Penabung Pemula', description: 'Total tabungan 1 juta', icon: '💰', category: 'savings', requirement: 1000000 },
  { id: 'savings_5m', name: 'Penabung Aktif', description: 'Total tabungan 5 juta', icon: '💵', category: 'savings', requirement: 5000000 },
  { id: 'savings_10m', name: 'Penabung Handal', description: 'Total tabungan 10 juta', icon: '💎', category: 'savings', requirement: 10000000 },
  { id: 'savings_50m', name: 'Penabung Pro', description: 'Total tabungan 50 juta', icon: '🏅', category: 'savings', requirement: 50000000 },
  { id: 'savings_100m', name: 'Jutawan', description: 'Total tabungan 100 juta', icon: '🎖️', category: 'savings', requirement: 100000000 },
  
  // Budget achievements
  { id: 'budget_met_1', name: 'Disiplin', description: 'Tidak melebihi budget 1 bulan', icon: '✅', category: 'budget', requirement: 1 },
  { id: 'budget_met_3', name: 'Terkendali', description: 'Tidak melebihi budget 3 bulan', icon: '📈', category: 'budget', requirement: 3 },
  { id: 'budget_met_6', name: 'Ahli Budget', description: 'Tidak melebihi budget 6 bulan', icon: '🎯', category: 'budget', requirement: 6 },
  { id: 'budget_met_12', name: 'Master Budget', description: 'Tidak melebihi budget 12 bulan', icon: '🏆', category: 'budget', requirement: 12 },
]

interface GamificationState {
  progress: UserProgress
  initialized: boolean
  initialize: () => void
  updateProgress: (updates: Partial<UserProgress>) => void
  checkAndUnlockAchievements: () => Achievement[]
  getUnlockedAchievements: () => Achievement[]
  getLockedAchievements: () => Achievement[]
  updateStreak: (activityDate: string) => void
  incrementTransactions: () => void
  updateSavings: (totalSaved: number) => void
  incrementBudgetsMet: () => void
}

const defaultProgress: UserProgress = {
  totalTransactions: 0,
  totalSaved: 0,
  currentStreak: 0,
  longestStreak: 0,
  budgetsMet: 0,
  achievements: [],
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  progress: defaultProgress,
  initialized: false,

  initialize: () => {
    try {
      const stored = localStorage.getItem('pfm_gamification')
      if (stored) {
        const parsed = JSON.parse(stored) as UserProgress
        set({ progress: { ...defaultProgress, ...parsed }, initialized: true })
      } else {
        set({ initialized: true })
      }
    } catch {
      set({ initialized: true })
    }
  },

  updateProgress: (updates) => {
    const { progress } = get()
    const newProgress = { ...progress, ...updates }
    localStorage.setItem('pfm_gamification', JSON.stringify(newProgress))
    set({ progress: newProgress })
  },

  checkAndUnlockAchievements: () => {
    const { progress, updateProgress } = get()
    const newlyUnlocked: Achievement[] = []
    const now = new Date().toISOString()

    ACHIEVEMENTS.forEach(achievement => {
      if (progress.achievements.includes(achievement.id)) return

      let shouldUnlock = false

      switch (achievement.category) {
        case 'transactions':
          shouldUnlock = progress.totalTransactions >= achievement.requirement
          break
        case 'streak':
          shouldUnlock = progress.longestStreak >= achievement.requirement
          break
        case 'savings':
          shouldUnlock = progress.totalSaved >= achievement.requirement
          break
        case 'budget':
          shouldUnlock = progress.budgetsMet >= achievement.requirement
          break
      }

      if (shouldUnlock) {
        newlyUnlocked.push({ ...achievement, unlockedAt: now })
      }
    })

    if (newlyUnlocked.length > 0) {
      updateProgress({
        achievements: [...progress.achievements, ...newlyUnlocked.map(a => a.id)]
      })
    }

    return newlyUnlocked
  },

  getUnlockedAchievements: () => {
    const { progress } = get()
    return ACHIEVEMENTS.filter(a => progress.achievements.includes(a.id))
  },

  getLockedAchievements: () => {
    const { progress } = get()
    return ACHIEVEMENTS.filter(a => !progress.achievements.includes(a.id))
  },

  updateStreak: (activityDate: string) => {
    const { progress, updateProgress, checkAndUnlockAchievements } = get()
    const today = activityDate.split('T')[0]
    const lastActivity = progress.lastActivityDate?.split('T')[0]

    if (lastActivity === today) return // Already recorded today

    let newStreak = 1
    if (lastActivity) {
      const lastDate = new Date(lastActivity)
      const currentDate = new Date(today)
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        newStreak = progress.currentStreak + 1
      }
    }

    updateProgress({
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, progress.longestStreak),
      lastActivityDate: today,
    })

    checkAndUnlockAchievements()
  },

  incrementTransactions: () => {
    const { progress, updateProgress, checkAndUnlockAchievements } = get()
    updateProgress({ totalTransactions: progress.totalTransactions + 1 })
    checkAndUnlockAchievements()
  },

  updateSavings: (totalSaved: number) => {
    const { updateProgress, checkAndUnlockAchievements } = get()
    updateProgress({ totalSaved })
    checkAndUnlockAchievements()
  },

  incrementBudgetsMet: () => {
    const { progress, updateProgress, checkAndUnlockAchievements } = get()
    updateProgress({ budgetsMet: progress.budgetsMet + 1 })
    checkAndUnlockAchievements()
  },
}))
