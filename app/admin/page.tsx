'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, FileText, Clock, AlertCircle, TrendingUp, 
  Trophy, Calendar, Filter, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogCard, Log } from '@/components/log-card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays } from 'date-fns'
import Link from 'next/link'

interface Employee {
  id: string
  name: string
  email: string
  _count: { logs: number }
}

interface LeaderboardItem {
  id: string
  name: string
  email: string
  logCount: number
  totalDuration: number
}

interface Stats {
  totalLogs: number
  weeklyLogs: number
  pendingReview: number
  totalDuration: number
  totalEmployees: number
}

interface DailyActivity {
  date: string
  count: number
}

export default function AdminDashboardPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    weeklyLogs: 0,
    pendingReview: 0,
    totalDuration: 0,
    totalEmployees: 0,
  })
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedUser) params.set('userId', selectedUser)
      if (dateRange.startDate) params.set('startDate', dateRange.startDate)
      if (dateRange.endDate) params.set('endDate', dateRange.endDate)

      const res = await fetch(`/api/admin/dashboard?${params}`)
      const data = await res.json()

      setLogs(data.logs)
      setEmployees(data.employees)
      setStats(data.stats)
      setDailyActivity(data.dailyActivity)
      setLeaderboard(data.leaderboard)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedUser, dateRange])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleReview = async (logId: string, status: string) => {
    const res = await fetch(`/api/logs/${logId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      fetchDashboard()
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
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Pantau aktivitas seluruh karyawan
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Karyawan
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Karyawan</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalEmployees}</p>
              <p className="text-xs text-slate-400">Karyawan</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalLogs}</p>
              <p className="text-xs text-slate-400">Total Log</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
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
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pendingReview}</p>
              <p className="text-xs text-slate-400">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-slate-400">Total Durasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Aktivitas 7 Hari Terakhir</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Leaderboard Minggu Ini</h2>
          </div>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition"
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-slate-400 text-white' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.logCount} log · {formatDuration(user.totalDuration)}</p>
                </div>
                <Link href={`/admin/users/${user.id}`}>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Daftar Karyawan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              href={`/admin/users/${emp.id}`}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
            >
              <div>
                <p className="text-sm font-medium text-white">{emp.name}</p>
                <p className="text-xs text-slate-400">{emp.email}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-400">{emp._count.logs}</p>
                <p className="text-xs text-slate-500">log</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Log Terbaru</h2>
        </div>
        {logs.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Belum ada log aktivitas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => (
              <LogCard
                key={log.id}
                log={log}
                showUser
                isAdmin
                onReview={handleReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
