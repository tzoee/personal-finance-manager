import { useState } from 'react'
import type { Achievement } from '../../types'

interface AchievementBadgeProps {
  achievement: Achievement
  isUnlocked: boolean
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export default function AchievementBadge({ 
  achievement, 
  isUnlocked, 
  size = 'md',
  showTooltip = true 
}: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false)

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  }

  return (
    <div className="relative">
      <button
        onClick={() => showTooltip && setShowDetails(!showDetails)}
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          transition-all duration-300 transform
          ${isUnlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg hover:scale-110 cursor-pointer' 
            : 'bg-gray-200 dark:bg-gray-700 grayscale opacity-50 cursor-default'
          }
        `}
        disabled={!showTooltip}
      >
        <span className={isUnlocked ? '' : 'opacity-50'}>{achievement.icon}</span>
        {isUnlocked && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </button>

      {/* Tooltip */}
      {showDetails && showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <span className="text-2xl">{achievement.icon}</span>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {achievement.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {achievement.description}
            </p>
            {isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ✓ Diraih {new Date(achievement.unlockedAt).toLocaleDateString('id-ID')}
              </p>
            )}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
            <div className="border-8 border-transparent border-t-white dark:border-t-gray-800" />
          </div>
        </div>
      )}
    </div>
  )
}
