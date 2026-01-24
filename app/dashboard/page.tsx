'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogForm, LogFormData } from '@/components/log-form'
import { LogCard, Log } from '@/components/log-card'
import { startOfWeek, endOfWeek, format } from 'date-fns'

interface Stats {
  totalLogs: number
  totalDuration: number
  weeklyLogs: number
  reviewedLogs: number
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    totalDuration: 0,
    weeklyLogs: 0,
    reviewedLogs: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs')
      const data = await res.json()
      setLogs(data)

      // Calculate stats
      const now = new Date()
      const weekStart = startOfWeek(now, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

      const weeklyLogs = data.filter((log: Log) => {
        const logDate = new Date(log.date)
        return logDate >= weekStart && logDate <= weekEnd
      })

      setStats({
        totalLogs: data.length,
        totalDuration: data.reduce((acc: number, log: Log) => acc + log.duration, 0),
        weeklyLogs: weeklyLogs.length,
        reviewedLogs: data.filter((log: Log) => log.status === 'REVIEWED').length,
      })
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleCreate = async (data: LogFormData) => {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setShowForm(false)
      fetchLogs()
    }
  }

  const handleUpdate = async (data: LogFormData) => {
    if (!editingLog) return

    const res = await fetch(`/api/logs/${editingLog.id}`, {
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

    const res = await fetch(`/api/logs/${id}`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Ringkasan aktivitas kerjamu
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Log
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalLogs}</p>
              <p className="text-xs text-slate-400">Total Log</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.weeklyLogs}</p>
              <p className="text-xs text-slate-400">Minggu Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-slate-400">Total Durasi</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.reviewedLogs}</p>
              <p className="text-xs text-slate-400">Reviewed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Riwayat Log</h2>
        {logs.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Belum ada log aktivitas</p>
            <p className="text-slate-500 text-sm mt-1">
              Klik &quot;Tambah Log&quot; untuk mulai mencatat kegiatanmu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogCard
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
        <LogForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingLog && (
        <LogForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingLog(null)}
          initialData={{
            title: editingLog.title,
            description: editingLog.description,
            date: format(new Date(editingLog.date), 'yyyy-MM-dd'),
            duration: editingLog.duration,
            mood: editingLog.mood || 'biasa',
          }}
          isEdit
        />
      )}
    </div>
  )
}
