'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, FileText, Image, File, Trash2 } from 'lucide-react'
import { startOfWeek, endOfWeek, format, getWeek, getYear } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface WeeklyLogFormProps {
  onSubmit: (data: WeeklyLogFormData) => Promise<void>
  onCancel: () => void
  initialData?: WeeklyLogFormData
  isEdit?: boolean
  logId?: string
}

export interface WeeklyLogFormData {
  title: string
  description: string
  summary: string
  totalDuration: number
  mood: string
  weekDate: string
}

export interface AttachmentData {
  id?: string
  fileName: string
  fileUrl?: string
  fileType: string
  fileSize: number
  file?: File
}

const moodOptions = [
  { value: 'produktif', label: '🔥 Produktif', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'biasa', label: '😊 Biasa', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'stuck', label: '😓 Stuck', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'overwhelmed', label: '😵 Overwhelmed', color: 'bg-red-50 text-red-700 border-red-200' },
]

const fileTypeIcons: Record<string, typeof FileText> = {
  document: FileText,
  image: Image,
  other: File,
}

export function WeeklyLogForm({ onSubmit, onCancel, initialData, isEdit, logId }: WeeklyLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentData[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const today = new Date()
  const defaultWeekDate = format(today, 'yyyy-MM-dd')
  
  const [formData, setFormData] = useState<WeeklyLogFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    summary: initialData?.summary || '',
    totalDuration: initialData?.totalDuration || 0,
    mood: initialData?.mood || 'biasa',
    weekDate: initialData?.weekDate || defaultWeekDate,
  })

  // Calculate week info from selected date
  const selectedDate = new Date(formData.weekDate)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekNumber = getWeek(selectedDate, { weekStartsOn: 1 })
  const year = getYear(selectedDate)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: AttachmentData[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" terlalu besar. Maksimal 10MB.`)
        continue
      }

      // Determine file type
      let fileType = 'other'
      if (file.type.startsWith('image/')) {
        fileType = 'image'
      } else if (
        file.type.includes('pdf') ||
        file.type.includes('document') ||
        file.type.includes('spreadsheet') ||
        file.type.includes('presentation') ||
        file.type.includes('text/')
      ) {
        fileType = 'document'
      }

      newAttachments.push({
        fileName: file.name,
        fileType,
        fileSize: file.size,
        file,
      })
    }

    setAttachments([...attachments, ...newAttachments])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const uploadAttachments = async (weeklyReportId: string) => {
    const filesToUpload = attachments.filter(a => a.file)
    
    for (const attachment of filesToUpload) {
      if (!attachment.file) continue
      
      const formData = new FormData()
      formData.append('file', attachment.file)
      
      await fetch(`/api/weekly-reports/${weeklyReportId}/attachments`, {
        method: 'POST',
        body: formData,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      
      // If editing and has new files, upload them
      if (isEdit && logId && attachments.some(a => a.file)) {
        setUploadingFiles(true)
        await uploadAttachments(logId)
        setUploadingFiles(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Log Mingguan' : 'Tambah Log Mingguan'}
            </h2>
            <p className="text-sm text-gray-500">
              Minggu {weekNumber}, {year} ({format(weekStart, 'd MMM', { locale: localeId })} - {format(weekEnd, 'd MMM yyyy', { locale: localeId })})
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Week Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Tanggal dalam Minggu
            </label>
            <input
              type="date"
              value={formData.weekDate}
              onChange={(e) => setFormData({ ...formData, weekDate: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isEdit}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Pilih tanggal mana saja dalam minggu yang ingin dilog
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kegiatan Minggu Ini
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Pengembangan Fitur Dashboard"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Detail Kegiatan
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan kegiatan yang kamu kerjakan selama minggu ini, progress, kendala yang dihadapi, dll..."
              rows={5}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ringkasan Mingguan (Opsional)
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Ringkasan singkat pencapaian minggu ini..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Durasi Kerja (menit)
            </label>
            <input
              type="number"
              value={formData.totalDuration}
              onChange={(e) => setFormData({ ...formData, totalDuration: parseInt(e.target.value) || 0 })}
              min="0"
              placeholder="Contoh: 2400 (untuk 40 jam)"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.totalDuration > 0 && `≈ ${Math.floor(formData.totalDuration / 60)} jam ${formData.totalDuration % 60} menit`}
            </p>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood Minggu Ini
            </label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: mood.value })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    formData.mood === mood.value
                      ? mood.color + ' ring-2 ring-red-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lampiran Dokumen/File
            </label>
            
            {/* Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Klik untuk upload atau drag & drop file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maksimal 10MB per file (PDF, Dokumen, Gambar)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif"
              />
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((attachment, index) => {
                  const FileIcon = fileTypeIcons[attachment.fileType] || File
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-50">
                          {attachment.fileName}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({formatFileSize(attachment.fileSize)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFiles}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Menyimpan...' : uploadingFiles ? 'Mengupload file...' : isEdit ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
