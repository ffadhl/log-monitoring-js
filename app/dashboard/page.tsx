'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, FileText, Clock, CheckCircle, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeeklyLogForm, WeeklyLogFormData } from '@/components/weekly-log-form'
import { WeeklyLogCard, WeeklyLog } from '@/components/weekly-log-card'
import { startOfWeek, endOfWeek, format, getWeek, getYear, addWeeks, subWeeks } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Stats {
  totalLogs: number
  totalDuration: number
  currentMonthLogs: number
  reviewedLogs: number
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<WeeklyLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    totalDuration: 0,
    currentMonthLogs: 0,
    reviewedLogs: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<WeeklyLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()))

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/weekly-logs?year=${selectedYear}`)
      const data = await res.json()
      setLogs(data)

      // Calculate stats
      const currentMonth = new Date().getMonth()
      const currentMonthLogs = data.filter((log: WeeklyLog) => {
        const logDate = new Date(log.weekStart)
        return logDate.getMonth() === currentMonth
      })

      setStats({
        totalLogs: data.length,
        totalDuration: data.reduce((acc: number, log: WeeklyLog) => acc + log.totalDuration, 0),
        currentMonthLogs: currentMonthLogs.length,
        reviewedLogs: data.filter((log: WeeklyLog) => log.status === 'REVIEWED').length,
      })
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleCreate = async (data: WeeklyLogFormData) => {
    const res = await fetch('/api/weekly-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      const newLog = await res.json()
      setShowForm(false)
      fetchLogs()
      return newLog.id
    } else {
      const error = await res.json()
      alert(error.error || 'Gagal membuat log')
    }
  }

  const handleUpdate = async (data: WeeklyLogFormData) => {
    if (!editingLog) return

    const res = await fetch(`/api/weekly-logs/${editingLog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setEditingLog(null)
      fetchLogs()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus log ini?')) return

    const res = await fetch(`/api/weekly-logs/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      fetchLogs()
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`
  }

  // Get current week info
  const today = new Date()
  const currentWeekNumber = getWeek(today, { weekStartsOn: 1 })
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 })
  
  // Check if current week log exists
  const hasCurrentWeekLog = logs.some(
    log => log.weekNumber === currentWeekNumber && log.year === selectedYear
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Log aktivitas mingguan
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Log Mingguan
        </Button>
      </div>

      {/* Current Week Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Minggu Ini</span>
            </div>
            <p className="text-2xl font-bold">
              Minggu {currentWeekNumber}, {getYear(today)}
            </p>
            <p className="text-red-100 text-sm mt-1">
              {format(currentWeekStart, 'd MMMM', { locale: localeId })} - {format(currentWeekEnd, 'd MMMM yyyy', { locale: localeId })}
            </p>
          </div>
          {!hasCurrentWeekLog && selectedYear === getYear(today) && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Log Minggu Ini
            </Button>
          )}
          {hasCurrentWeekLog && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              ✓ Log sudah dibuat
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              <p className="text-xs text-gray-500">Total Log {selectedYear}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.currentMonthLogs}</p>
              <p className="text-xs text-gray-500">Bulan Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-gray-500">Total Durasi</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.reviewedLogs}</p>
              <p className="text-xs text-gray-500">Reviewed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Year Selector & Logs List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Log Mingguan</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {selectedYear}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear >= getYear(new Date())}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {logs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada log mingguan untuk tahun {selectedYear}</p>
            <p className="text-gray-400 text-sm mt-1">
              Klik &quot;Tambah Log Mingguan&quot; untuk mulai mencatat kegiatanmu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <WeeklyLogCard
                key={log.id}
                log={log}
                onEdit={(log) => setEditingLog(log)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <WeeklyLogForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingLog && (
        <WeeklyLogForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingLog(null)}
          initialData={{
            title: editingLog.title,
            description: editingLog.description,
            summary: editingLog.summary || '',
            totalDuration: editingLog.totalDuration,
            mood: editingLog.mood || 'biasa',
            weekDate: format(new Date(editingLog.weekStart), 'yyyy-MM-dd'),
          }}
          isEdit
          logId={editingLog.id}
        />
      )}
    </div>
  )
}
