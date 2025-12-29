import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'

interface AccessibleInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  hideLabel?: boolean
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      hideLabel = false,
      className = '',
      id: providedId,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    const sizeClasses = {
      sm: 'min-h-[36px] px-3 py-1.5 text-sm',
      md: 'min-h-[44px] px-4 py-2 text-base',
      lg: 'min-h-[52px] px-5 py-3 text-lg',
    }

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className={`
            block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1
            ${hideLabel ? 'sr-only' : ''}
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>

        <div className="relative">
          {leftIcon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${iconSizeClasses[size]}`}>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            className={`
              w-full rounded-lg border transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-gray-800 dark:text-gray-100
              ${sizeClasses[size]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
              }
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
            }
            required={required}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 ${iconSizeClasses[size]}`}>
              {rightIcon}
            </div>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

export default AccessibleInput
