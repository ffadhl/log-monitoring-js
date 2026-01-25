'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, FileText, Clock, CheckCircle, 
  AlertCircle, Calendar, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogCard, Log } from '@/components/log-card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Stats {
  totalLogs: number
  weeklyLogs: number
  reviewedLogs: number
  pendingLogs: number
  totalDuration: number
}

interface DailyActivity {
  date: string
  count: number
  duration: number
}

interface MoodItem {
  mood: string
  _count: number
}

const moodColors: Record<string, string> = {
  produktif: '#22c55e',
  biasa: '#3b82f6',
  stuck: '#f59e0b',
  overwhelmed: '#ef4444',
}

const moodLabels: Record<string, string> = {
  produktif: '🔥 Produktif',
  biasa: '😊 Biasa',
  stuck: '😓 Stuck',
  overwhelmed: '😵 Overwhelmed',
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    weeklyLogs: 0,
    reviewedLogs: 0,
    pendingLogs: 0,
    totalDuration: 0,
  })
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [moodDistribution, setMoodDistribution] = useState<MoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  })

  const fetchUserData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.set('startDate', dateRange.startDate)
      if (dateRange.endDate) params.set('endDate', dateRange.endDate)

      const res = await fetch(`/api/admin/users/${id}?${params}`)
      
      if (!res.ok) {
        router.push('/admin')
        return
      }

      const data = await res.json()

      setUserInfo(data.user)
      setLogs(data.logs)
      setStats(data.stats)
      setDailyActivity(data.dailyActivity)
      setMoodDistribution(data.moodDistribution)
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [id, dateRange, router])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleReview = async (logId: string, status: string) => {
    const res = await fetch(`/api/logs/${logId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      fetchUserData()
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

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">User tidak ditemukan</div>
      </div>
    )
  }

  const pieData = moodDistribution.map((item) => ({
    name: moodLabels[item.mood] || item.mood,
    value: item._count,
    color: moodColors[item.mood] || '#6b7280',
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/admin')}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      {/* User Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{userInfo.name}</h1>
            <p className="text-gray-500">{userInfo.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Bergabung {format(new Date(userInfo.createdAt), 'd MMMM yyyy', { locale: localeId })}
            </p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="text-gray-500">sampai</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              <p className="text-xs text-gray-500">Total Log</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
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
              <p className="text-2xl font-bold text-gray-900">{stats.pendingLogs}</p>
              <p className="text-xs text-gray-500">Pending</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas 14 Hari Terakhir</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
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
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.2}
                  name="Jumlah Log"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Mood</h2>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Belum ada data mood
            </div>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Log</h2>
        {logs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada log aktivitas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
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
