'use client'

import * as React from 'react'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  ChevronRight,
  Calendar,
  Target,
  Eye,
  BookOpen,
  ClipboardCheck,
  ChevronDown,
  Trash2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { formatDate, formatDateRange } from '@/lib/date-utils'
import { REPORT_STATUS_CONFIG, GOAL_STATUS_CONFIG, type WeeklyReport, type User, type CareerGoal } from '@/lib/types'

interface TeamMember extends User {
  weeklyReports: WeeklyReport[]
  careerGoals: CareerGoal[]
  _count: {
    dailyLogs: number
    weeklyReports: number
    careerGoals: number
  }
}

interface DailyLog {
  id: string
  content: string
  mood: string | null
  date: Date
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

interface TeamReviewClientProps {
  subordinates: TeamMember[]
  pendingReports: (WeeklyReport & { user: User })[]
  teamDailyLogs: DailyLog[]
}

export function TeamReviewClient({ subordinates, pendingReports, teamDailyLogs }: TeamReviewClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultTab = searchParams.get('tab') || 'daily-logs'
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedReport, setSelectedReport] = useState<(WeeklyReport & { user: User }) | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [localPendingReports, setLocalPendingReports] = useState(pendingReports)
  const [localSubordinates, setLocalSubordinates] = useState(subordinates)
  const [goalFeedback, setGoalFeedback] = useState<{ [key: string]: string }>({})
  const [savingGoalId, setSavingGoalId] = useState<string | null>(null)
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all')
  const [expandedDates, setExpandedDates] = useState<string[]>([])

  const stats = {
    teamSize: subordinates.length,
    pendingReviews: localPendingReports.length,
    todayLogs: teamDailyLogs.filter(log => 
      formatDate(log.date, 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd')
    ).length,
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/app/team-review?tab=${value}`, { scroll: false })
  }

  // Group daily logs by date
  const groupedLogs = React.useMemo(() => {
    const filtered = selectedMemberFilter === 'all' 
      ? teamDailyLogs 
      : teamDailyLogs.filter(log => log.user.id === selectedMemberFilter)
    
    const groups: { [date: string]: DailyLog[] } = {}
    filtered.forEach(log => {
      const dateKey = formatDate(log.date, 'yyyy-MM-dd')
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(log)
    })
    return groups
  }, [teamDailyLogs, selectedMemberFilter])

  const handleSubmitReview = async () => {
    if (!selectedReport || !feedback.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/weekly-reports/${selectedReport.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })

      if (response.ok) {
        setLocalPendingReports(localPendingReports.filter((r) => r.id !== selectedReport.id))
        setSelectedReport(null)
        setFeedback('')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddGoalFeedback = async (goalId: string, comment: string) => {
    if (!comment.trim()) return
    
    setSavingGoalId(goalId)
    try {
      const response = await fetch(`/api/career-goals/${goalId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })

      if (response.ok) {
        const data = await response.json()
        setLocalSubordinates(localSubordinates.map(sub => ({
          ...sub,
          careerGoals: sub.careerGoals.map(goal => 
            goal.id === goalId ? { ...goal, managerComment: data.goal.managerComment } : goal
          )
        })))
        if (selectedMember) {
          setSelectedMember({
            ...selectedMember,
            careerGoals: selectedMember.careerGoals.map(goal =>
              goal.id === goalId ? { ...goal, managerComment: data.goal.managerComment } : goal
            )
          })
        }
        setGoalFeedback(prev => ({ ...prev, [goalId]: '' }))
      }
    } catch (error) {
      console.error('Failed to add feedback:', error)
    } finally {
      setSavingGoalId(null)
    }
  }

  const handleDeleteGoalFeedback = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    
    setSavingGoalId(goalId)
    try {
      const response = await fetch(`/api/career-goals/${goalId}/comment`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLocalSubordinates(localSubordinates.map(sub => ({
          ...sub,
          careerGoals: sub.careerGoals.map(goal => 
            goal.id === goalId ? { ...goal, managerComment: null } : goal
          )
        })))
        if (selectedMember) {
          setSelectedMember({
            ...selectedMember,
            careerGoals: selectedMember.careerGoals.map(goal =>
              goal.id === goalId ? { ...goal, managerComment: null } : goal
            )
          })
        }
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error)
    } finally {
      setSavingGoalId(null)
    }
  }

  const toggleDateExpanded = (dateKey: string) => {
    setExpandedDates(prev => 
      prev.includes(dateKey) 
        ? prev.filter(d => d !== dateKey)
        : [...prev, dateKey]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Activity</h1>
        <p className="text-muted-foreground">
          Monitor daily logs, review weekly reports, and manage team career goals
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <BookOpen className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Logs</p>
                <p className="text-3xl font-bold">{stats.todayLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-bold">{stats.pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-3xl font-bold">{stats.teamSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-muted/50">
          <TabsTrigger 
            value="daily-logs" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground font-medium"
          >
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">Daily Logs</span>
            <span className="sm:hidden">Logs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground font-medium"
          >
            <ClipboardCheck className="size-4" />
            <span className="hidden sm:inline">Weekly Reviews</span>
            <span className="sm:hidden">Reviews</span>
            {stats.pendingReviews > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {stats.pendingReviews}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground font-medium"
          >
            <Target className="size-4" />
            <span className="hidden sm:inline">Career Goals</span>
            <span className="sm:hidden">Goals</span>
          </TabsTrigger>
        </TabsList>

        {/* Daily Logs Tab */}
        <TabsContent value="daily-logs" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Label className="text-sm text-muted-foreground">Filter by member:</Label>
            <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                {subordinates.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {Object.keys(groupedLogs).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedLogs)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([dateKey, logs]) => {
                  const isToday = dateKey === formatDate(new Date(), 'yyyy-MM-dd')
                  const isExpanded = expandedDates.includes(dateKey) || isToday
                  
                  return (
                    <Collapsible key={dateKey} open={isExpanded} onOpenChange={() => toggleDateExpanded(dateKey)}>
                      <Card className={`border-2 ${isToday ? 'border-blue-200' : 'border-muted'}`}>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isToday ? 'bg-blue-100' : 'bg-muted'}`}>
                                  <Calendar className={`size-4 ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`} />
                                </div>
                                <div className="text-left">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    {formatDate(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                                    {isToday && (
                                      <Badge className="bg-blue-600">Today</Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription>
                                    {logs.length} {logs.length === 1 ? 'log' : 'logs'} from team members
                                  </CardDescription>
                                </div>
                              </div>
                              <ChevronDown className={`size-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              {logs.map((log) => (
                                <div
                                  key={log.id}
                                  className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <Avatar className="size-10 shrink-0">
                                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {getInitials(log.user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="text-sm font-medium">{log.user.name}</p>
                                        <div className="flex items-center gap-2">
                                          {log.mood && (
                                            <span className="text-lg" title="Mood">
                                              {log.mood}
                                            </span>
                                          )}
                                          <span className="text-xs text-muted-foreground">
                                            {formatDate(log.createdAt, 'HH:mm')}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-2">{log.user.email}</p>
                                      <p className="text-sm whitespace-pre-wrap">{log.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="size-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No logs this week</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Team members haven&apos;t submitted any logs for this week yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-4">
          {localPendingReports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {localPendingReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(report.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {report.user.name}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {report.user.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Week {report.weekNumber}, {report.year}
                      </span>
                      <Badge
                        variant="secondary"
                        className={REPORT_STATUS_CONFIG[report.status].color}
                      >
                        {REPORT_STATUS_CONFIG[report.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateRange(report.startDate, report.endDate)}
                    </p>
                    {report.summary && (
                      <p className="text-sm line-clamp-2">{report.summary}</p>
                    )}
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedReport(report)
                        setFeedback('')
                      }}
                    >
                      <Eye className="size-4 mr-2" />
                      Review Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="size-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No pending weekly reports to review
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Career Goals Tab */}
        <TabsContent value="team" className="space-y-4">
          {subordinates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subordinates.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {member.name}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {member.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-semibold">{member._count.dailyLogs}</p>
                        <p className="text-xs text-muted-foreground">Logs</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-semibold">{member._count.weeklyReports}</p>
                        <p className="text-xs text-muted-foreground">Reports</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-lg font-semibold">{member._count.careerGoals}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedMember(member)}
                    >
                      <Target className="size-4 mr-2" />
                      View Goals & Give Feedback
                      <ChevronRight className="size-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="size-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No team members</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You don&apos;t have any subordinates assigned yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Report Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5" />
              Review Weekly Report
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <>
                  {selectedReport.user.name} - Week {selectedReport.weekNumber},{' '}
                  {selectedReport.year}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Period</Label>
                <p className="text-sm">
                  {formatDateRange(selectedReport.startDate, selectedReport.endDate)}
                </p>
              </div>

              {selectedReport.summary && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Weekly Summary</Label>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.summary}</p>
                  </div>
                </div>
              )}

              {selectedReport.dailyLogs && selectedReport.dailyLogs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Daily Logs ({selectedReport.dailyLogs.length})</Label>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {selectedReport.dailyLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Calendar className="size-4" />
                            {formatDate(log.date, 'EEEE, MMM d')}
                            {log.mood && <span className="ml-auto text-lg">{log.mood}</span>}
                          </div>
                          <p className="text-sm">{log.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Your Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, suggestions, or encouragement..."
                  className="min-h-32"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview} 
              disabled={isSaving || !feedback.trim()}
            >
              <Send className="size-4 mr-2" />
              {isSaving ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Career Goals Feedback Sheet */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-auto p-6">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-4">
              {selectedMember && (
                <>
                  <Avatar className="size-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-xl">{selectedMember.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedMember.email}
                    </p>
                  </div>
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              Review and provide feedback on career goals
            </SheetDescription>
          </SheetHeader>
          
          {selectedMember && (
            <div className="mt-4 space-y-6 pb-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-2xl font-bold">{selectedMember._count.dailyLogs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Logs</p>
                </div>
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-2xl font-bold">{selectedMember._count.weeklyReports}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reports</p>
                </div>
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-2xl font-bold">{selectedMember._count.careerGoals}</p>
                  <p className="text-xs text-muted-foreground mt-1">Goals</p>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Career Goals */}
              <div className="space-y-4">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  <Target className="size-5" />
                  Career Goals
                </h4>
                {selectedMember.careerGoals.length > 0 ? (
                  <div className="space-y-5">
                    {selectedMember.careerGoals.map((goal) => (
                      <Card key={goal.id} className="shadow-sm">
                        <CardHeader className="pb-4 pt-5 px-5">
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-base">{goal.title}</CardTitle>
                            <Badge
                              variant="secondary"
                              className={`shrink-0 ${GOAL_STATUS_CONFIG[goal.status].color}`}
                            >
                              {GOAL_STATUS_CONFIG[goal.status].label}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm leading-relaxed">
                            {goal.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-5 pb-5">
                          {/* Existing feedback */}
                          {goal.managerComment && (
                            <div className="p-4 rounded-lg bg-muted">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="size-4 text-muted-foreground" />
                                  <span className="text-xs font-medium">Your Feedback</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteGoalFeedback(goal.id)}
                                  disabled={savingGoalId === goal.id}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                              <p className="text-sm">{goal.managerComment}</p>
                            </div>
                          )}
                          
                          {/* Feedback input */}
                          <div className="space-y-4">
                            <Label className="text-sm font-medium">
                              {goal.managerComment ? 'Update Feedback' : 'Add Feedback'}
                            </Label>
                            <Textarea
                              placeholder="Share your thoughts, suggestions, or encouragement about this goal..."
                              value={goalFeedback[goal.id] || ''}
                              onChange={(e) => setGoalFeedback(prev => ({ ...prev, [goal.id]: e.target.value }))}
                              className="min-h-28"
                            />
                            <Button
                              className="w-full"
                              disabled={!goalFeedback[goal.id]?.trim() || savingGoalId === goal.id}
                              onClick={() => handleAddGoalFeedback(goal.id, goalFeedback[goal.id])}
                            >
                              {savingGoalId === goal.id ? (
                                'Saving...'
                              ) : (
                                <>
                                  <Send className="size-4 mr-2" />
                                  {goal.managerComment ? 'Update Feedback' : 'Send Feedback'}
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Target className="size-10 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-3">
                        No career goals set yet
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
