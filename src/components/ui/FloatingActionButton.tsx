/**
 * FloatingActionButton (FAB) Component
 * Floating action button with optional speed dial menu
 */

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface FABAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  icon?: React.ReactNode
  onClick?: () => void
  actions?: FABAction[]
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left'
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  hideOnScroll?: boolean
}

export default function FloatingActionButton({
  icon = <Plus className="w-6 h-6" />,
  onClick,
  actions,
  position = 'bottom-right',
  color = 'bg-primary-600 hover:bg-primary-700',
  size = 'md',
  className = '',
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    'bottom-right': 'right-4 bottom-20 md:bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-20 md:bottom-6',
    'bottom-left': 'left-4 bottom-20 md:bottom-6',
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  }

  const handleMainClick = () => {
    if (actions && actions.length > 0) {
      setIsOpen(!isOpen)
    } else if (onClick) {
      onClick()
    }
  }

  const handleActionClick = (action: FABAction) => {
    setIsOpen(false)
    action.onClick()
  }

  return (
    <div className={`fixed z-40 ${positionClasses[position]} ${className}`}>
      {/* Speed Dial Actions */}
      {actions && actions.length > 0 && (
        <div
          className={`absolute bottom-full mb-3 flex flex-col-reverse gap-3 transition-all duration-200 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              {/* Label */}
              <span className="px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                {action.label}
              </span>
              
              {/* Mini FAB */}
              <button
                onClick={() => handleActionClick(action)}
                className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 ${
                  action.color || 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Backdrop for speed dial */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main FAB */}
      <button
        onClick={handleMainClick}
        className={`${sizeClasses[size]} rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 ${color}`}
      >
        <span
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : icon}
        </span>
      </button>
    </div>
  )
}
