import { AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react'
import type { Insight } from '../../types'

interface InsightCardProps {
  insights: Insight[]
}

export default function InsightCard({ insights }: InsightCardProps) {
  if (insights.length === 0) {
    return null
  }

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'info':
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
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Insights</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {insights.slice(0, 4).map((insight, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getBgColor(insight.type)}`}
          >
            {getIcon(insight.type)}
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {insight.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
