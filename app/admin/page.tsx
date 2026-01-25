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
        <div className="text-gray-500">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Pantau aktivitas seluruh karyawan
          </p>
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Karyawan
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-xs text-gray-500">Karyawan</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              <p className="text-xs text-gray-500">Total Log</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.weeklyLogs}</p>
              <p className="text-xs text-gray-500">Minggu Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              <p className="text-xs text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
              <p className="text-xs text-gray-500">Total Durasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Aktivitas 7 Hari Terakhir</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#111827' }}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Leaderboard Minggu Ini</h2>
          </div>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.logCount} log · {formatDuration(user.totalDuration)}</p>
                </div>
                <Link href={`/admin/users/${user.id}`}>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Daftar Karyawan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map((emp) => (
            <Link
              key={emp.id}
              href={`/admin/users/${emp.id}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.email}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">{emp._count.logs}</p>
                <p className="text-xs text-gray-400">log</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Logs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Log Terbaru</h2>
        </div>
        {logs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada log aktivitas</p>
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
