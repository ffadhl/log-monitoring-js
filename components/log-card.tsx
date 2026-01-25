'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Log {
  id: string
  title: string
  description: string
  date: string
  duration: number
  mood: string | null
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED'
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

interface LogCardProps {
  log: Log
  onEdit?: (log: Log) => void
  onDelete?: (id: string) => void
  onReview?: (id: string, status: string) => void
  showUser?: boolean
  isAdmin?: boolean
}

const moodEmoji: Record<string, string> = {
  produktif: '🔥',
  biasa: '😊',
  stuck: '😓',
  overwhelmed: '😵',
}

const statusStyles: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-600', icon: AlertCircle },
  SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-600', icon: Clock },
  REVIEWED: { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle },
}

export function LogCard({ log, onEdit, onDelete, onReview, showUser, isAdmin }: LogCardProps) {
  const statusStyle = statusStyles[log.status]
  const StatusIcon = statusStyle.icon

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`
    }
    return `${minutes} menit`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-3 h-3" />
              {log.status}
            </span>
            {log.mood && (
              <span className="text-lg" title={log.mood}>
                {moodEmoji[log.mood] || '😊'}
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(log.duration)}
            </span>
          </div>

          <h3 className="text-gray-900 font-medium mb-1">{log.title}</h3>
          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{log.description}</p>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{format(new Date(log.date), 'EEEE, d MMMM yyyy', { locale: id })}</span>
            {showUser && log.user && (
              <span className="text-red-600">oleh {log.user.name}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {log.status !== 'REVIEWED' && onEdit && (
            <Button
              onClick={() => onEdit(log)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {log.status !== 'REVIEWED' && onDelete && (
            <Button
              onClick={() => onDelete(log.id)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && log.status === 'SUBMITTED' && onReview && (
            <Button
              onClick={() => onReview(log.id, 'REVIEWED')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              ✓ Review
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
