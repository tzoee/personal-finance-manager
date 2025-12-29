import { useState } from 'react'
import { Award, ChevronRight, Lock } from 'lucide-react'
import type { Achievement } from '../../types'
import AchievementBadge from './AchievementBadge'

interface AchievementShowcaseProps {
  unlockedAchievements: Achievement[]
  lockedAchievements: Achievement[]
  recentUnlock?: Achievement
}

export default function AchievementShowcase({
  unlockedAchievements,
  lockedAchievements,
  recentUnlock,
}: AchievementShowcaseProps) {
  const [showAll, setShowAll] = useState(false)
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked'>('unlocked')

  const displayedUnlocked = showAll ? unlockedAchievements : unlockedAchievements.slice(0, 6)
  const displayedLocked = showAll ? lockedAchievements : lockedAchievements.slice(0, 6)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Pencapaian
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({unlockedAchievements.length}/{unlockedAchievements.length + lockedAchievements.length})
          </span>
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          {showAll ? 'Tutup' : 'Lihat Semua'}
          <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Recent Unlock Banner */}
      {recentUnlock && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce-subtle">{recentUnlock.icon}</span>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                🎉 Pencapaian Baru!
              </p>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                {recentUnlock.name}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {recentUnlock.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {showAll && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === 'unlocked'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Diraih ({unlockedAchievements.length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'locked'
                ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Lock className="w-3 h-3" />
            Terkunci ({lockedAchievements.length})
          </button>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid grid-cols-6 gap-2">
        {!showAll ? (
          // Compact view - show mix of unlocked
          <>
            {displayedUnlocked.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={true}
                size="sm"
              />
            ))}
            {displayedUnlocked.length < 6 && displayedLocked.slice(0, 6 - displayedUnlocked.length).map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={false}
                size="sm"
              />
            ))}
          </>
        ) : (
          // Full view - show based on active tab
          (activeTab === 'unlocked' ? displayedUnlocked : displayedLocked).map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isUnlocked={activeTab === 'unlocked'}
              size="sm"
            />
          ))
        )}
      </div>

      {/* Empty State */}
      {showAll && activeTab === 'unlocked' && unlockedAchievements.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Belum ada pencapaian</p>
          <p className="text-sm">Mulai catat transaksi untuk membuka pencapaian!</p>
        </div>
      )}

      {/* Progress hint */}
      {!showAll && lockedAchievements.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          {lockedAchievements.length} pencapaian lagi menunggu untuk dibuka
        </p>
      )}
    </div>
  )
}
