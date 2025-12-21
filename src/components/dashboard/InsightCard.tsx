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
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor(insight.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {insight.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
