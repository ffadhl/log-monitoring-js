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
        <div className="text-slate-400">Memuat data...</div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">User tidak ditemukan</div>
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
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      {/* User Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{userInfo.name}</h1>
            <p className="text-slate-400">{userInfo.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              Bergabung {format(new Date(userInfo.createdAt), 'd MMMM yyyy', { locale: localeId })}
            </p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-400">sampai</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pendingLogs}</p>
              <p className="text-xs text-slate-400">Pending</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Aktivitas 14 Hari Terakhir</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity}>
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
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Jumlah Log"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Distribusi Mood</h2>
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
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
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
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              Belum ada data mood
            </div>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Riwayat Log</h2>
        {logs.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Belum ada log aktivitas</p>
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
