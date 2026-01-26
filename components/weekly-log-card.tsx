'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Edit, Trash2, Clock, CheckCircle, AlertCircle, Paperclip, FileText, Image, File } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface WeeklyLogAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

export interface WeeklyLog {
  id: string
  weekStart: string
  weekEnd: string
  weekNumber: number
  year: number
  title: string
  description: string
  summary: string | null
  totalDuration: number
  mood: string | null
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED'
  createdAt: string
  attachments: WeeklyLogAttachment[]
  user?: {
    name: string
    email: string
  }
}

interface WeeklyLogCardProps {
  log: WeeklyLog
  onEdit?: (log: WeeklyLog) => void
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

const fileTypeIcons: Record<string, typeof FileText> = {
  document: FileText,
  image: Image,
  other: File,
}

export function WeeklyLogCard({ log, onEdit, onDelete, onReview, showUser, isAdmin }: WeeklyLogCardProps) {
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
              Minggu {log.weekNumber}, {log.year}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon className="w-3 h-3" />
              {log.status}
            </span>
            {log.mood && (
              <span className="text-lg" title={log.mood}>
                {moodEmoji[log.mood] || '😊'}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-gray-900 font-semibold text-lg mb-1">{log.title}</h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{log.description}</p>

          {/* Summary if exists */}
          {log.summary && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Ringkasan: </span>
                {log.summary}
              </p>
            </div>
          )}

          {/* Attachments */}
          {log.attachments && log.attachments.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <Paperclip className="w-3 h-3" />
                <span>{log.attachments.length} lampiran</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {log.attachments.slice(0, 3).map((attachment) => {
                  const FileIcon = fileTypeIcons[attachment.fileType] || File
                  return (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600 hover:bg-gray-200 transition"
                    >
                      <FileIcon className="w-3 h-3" />
                      <span className="truncate max-w-25">{attachment.fileName}</span>
                      <span className="text-gray-400">({formatFileSize(attachment.fileSize)})</span>
                    </a>
                  )
                })}
                {log.attachments.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{log.attachments.length - 3} lainnya
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              {format(new Date(log.weekStart), 'd MMM', { locale: id })} - {format(new Date(log.weekEnd), 'd MMM yyyy', { locale: id })}
            </span>
            {log.totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(log.totalDuration)}
              </span>
            )}
            {showUser && log.user && (
              <span className="text-red-600">oleh {log.user.name}</span>
            )}
          </div>
        </div>

        {/* Actions */}
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
