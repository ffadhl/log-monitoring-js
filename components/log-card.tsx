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
  DRAFT: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertCircle },
  SUBMITTED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
  REVIEWED: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition">
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
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(log.duration)}
            </span>
          </div>

          <h3 className="text-white font-medium mb-1">{log.title}</h3>
          <p className="text-slate-400 text-sm mb-2 line-clamp-2">{log.description}</p>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{format(new Date(log.date), 'EEEE, d MMMM yyyy', { locale: id })}</span>
            {showUser && log.user && (
              <span className="text-blue-400">oleh {log.user.name}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {log.status !== 'REVIEWED' && onEdit && (
            <Button
              onClick={() => onEdit(log)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {log.status !== 'REVIEWED' && onDelete && (
            <Button
              onClick={() => onDelete(log.id)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {isAdmin && log.status === 'SUBMITTED' && onReview && (
            <Button
              onClick={() => onReview(log.id, 'REVIEWED')}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-xs"
            >
              ✓ Review
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
