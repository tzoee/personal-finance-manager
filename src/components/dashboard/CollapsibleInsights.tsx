import { useState } from 'react'
import { Lightbulb, ChevronDown, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { Insight } from '../../types'

interface CollapsibleInsightsProps {
  insights: Insight[]
}

export default function CollapsibleInsights({ insights }: CollapsibleInsightsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (insights.length === 0) return null

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20'
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Insights
          </span>
          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
            {insights.length}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-3 rounded-lg ${getBgColor(insight.type)}`}
            >
              {getIcon(insight.type)}
              <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
