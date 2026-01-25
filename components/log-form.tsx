'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface LogFormProps {
  onSubmit: (data: LogFormData) => Promise<void>
  onCancel: () => void
  initialData?: LogFormData
  isEdit?: boolean
}

export interface LogFormData {
  title: string
  description: string
  date: string
  duration: number
  mood: string
}

const moodOptions = [
  { value: 'produktif', label: '🔥 Produktif', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'biasa', label: '😊 Biasa', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'stuck', label: '😓 Stuck', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'overwhelmed', label: '😵 Overwhelmed', color: 'bg-red-50 text-red-700 border-red-200' },
]

export function LogForm({ onSubmit, onCancel, initialData, isEdit }: LogFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<LogFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    duration: initialData?.duration || 60,
    mood: initialData?.mood || 'biasa',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Log Aktivitas' : 'Tambah Log Aktivitas'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kegiatan
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Belajar deploy Docker"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Detail
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan apa yang kamu kerjakan, kendala yang dihadapi, dll..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durasi (menit)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              min="1"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood Hari Ini
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
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
