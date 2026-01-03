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

  const handleActionClick = (action: FABAction, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(false)
    // Use setTimeout to ensure state update completes before navigation
    setTimeout(() => {
      action.onClick()
    }, 10)
  }

  return (
    <>
      {/* Backdrop for speed dial - separate from FAB container */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
        {/* Speed Dial Actions */}
        {actions && actions.length > 0 && isOpen && (
          <div className="absolute bottom-full mb-3 right-0 flex flex-col-reverse gap-3">
            {actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-3 justify-end"
                style={{
                  animation: `fadeInUp 0.2s ease-out ${index * 50}ms forwards`,
                  opacity: 0,
                }}
              >
                {/* Label */}
                <span className="px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                  {action.label}
                </span>
                
                {/* Mini FAB */}
                <button
                  type="button"
                  onClick={(e) => handleActionClick(action, e)}
                  className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 ${
                    action.color || 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          type="button"
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
      
      {/* Add keyframes for animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
