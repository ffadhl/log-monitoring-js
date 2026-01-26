// lib/types.ts
// CareerTrack Type Definitions

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED'
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  managerId?: string | null
  manager?: User | null
  subordinates?: User[]
  createdAt: Date
}

export interface DailyLog {
  id: string
  date: Date
  content: string
  mood?: string | null
  weeklyReportId?: string | null
  weeklyReport?: WeeklyReport | null
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
}

export interface WeeklyReport {
  id: string
  startDate: Date
  endDate: Date
  weekNumber: number
  year: number
  summary?: string | null
  managerFeedback?: string | null
  status: ReportStatus
  userId: string
  user?: User
  dailyLogs?: DailyLog[]
  attachments?: Attachment[]
  createdAt: Date
  updatedAt: Date
}

export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  weeklyReportId: string
  weeklyReport?: WeeklyReport
  createdAt: Date
}

export interface CareerGoal {
  id: string
  title: string
  description: string
  targetDate?: Date | null
  status: GoalStatus
  managerComment?: string | null
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard Stats
export interface DashboardStats {
  totalLogs: number
  logsThisWeek: number
  weeklyReportsSubmitted: number
  careerGoalsInProgress: number
  recentLogs: DailyLog[]
  weeklyActivity: { day: string; logs: number }[]
}

// Manager Dashboard Stats
export interface ManagerDashboardStats extends DashboardStats {
  teamSize: number
  pendingReviews: number
  subordinates: User[]
}

// Mood options for daily logs
export const MOOD_OPTIONS = [
  { value: '😊', label: 'Great' },
  { value: '🙂', label: 'Good' },
  { value: '😐', label: 'Neutral' },
  { value: '😔', label: 'Struggling' },
  { value: '🔥', label: 'Productive' },
  { value: '💡', label: 'Learning' },
  { value: '🎯', label: 'Focused' },
] as const

// Goal status display config
export const GOAL_STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', color: 'bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  ON_HOLD: { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
} as const

// Report status display config
export const REPORT_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  REVIEWED: { label: 'Reviewed', color: 'bg-green-100 text-green-700' },
} as const
