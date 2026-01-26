'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  ChevronRight,
  Calendar,
  Target,
  Eye,
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

interface TeamReviewClientProps {
  subordinates: TeamMember[]
  pendingReports: (WeeklyReport & { user: User })[]
}

export function TeamReviewClient({ subordinates, pendingReports }: TeamReviewClientProps) {
  const [selectedReport, setSelectedReport] = useState<(WeeklyReport & { user: User }) | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [localPendingReports, setLocalPendingReports] = useState(pendingReports)

  const stats = {
    teamSize: subordinates.length,
    pendingReviews: localPendingReports.length,
    totalReportsReviewed: subordinates.reduce(
      (sum, m) => sum + m.weeklyReports.filter((r) => r.status === 'REVIEWED').length,
      0
    ),
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
        // Remove from pending
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

  // Function to add manager comment to goals - can be used in member details
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddGoalComment = async (goalId: string, comment: string) => {
    try {
      const response = await fetch(`/api/career-goals/${goalId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })

      if (response.ok) {
        // Refresh the member data
        setSelectedMember(null)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Review</h1>
        <p className="text-muted-foreground">
          Review your team&apos;s weekly reports and provide feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Members</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.teamSize}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.pendingReviews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Reports Reviewed</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalReportsReviewed}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <FileText className="size-4" />
            Pending Reviews
            {stats.pendingReviews > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats.pendingReviews}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="size-4" />
            Team Members
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-4">
          {localPendingReports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {localPendingReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
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
                <CheckCircle className="size-12 mx-auto text-emerald-500" />
                <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No pending reviews at the moment
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-4">
          {subordinates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subordinates.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
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
                      View Profile
                      <ChevronRight className="size-4 ml-2" />
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
            <DialogTitle>Review Weekly Report</DialogTitle>
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
              {/* Report Info */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Period</Label>
                <p className="text-sm">
                  {formatDateRange(selectedReport.startDate, selectedReport.endDate)}
                </p>
              </div>

              {/* Summary */}
              {selectedReport.summary && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Weekly Summary</Label>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.summary}</p>
                  </div>
                </div>
              )}

              {/* Daily Logs */}
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

              {/* Feedback Input */}
              <div className="space-y-2">
                <Label>Your Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, suggestions, or encouragement..."
                  className="min-h-30"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSaving || !feedback.trim()}>
              <Send className="size-4 mr-2" />
              {isSaving ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Member Sheet */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-auto p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-4">
              {selectedMember && (
                <>
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-lg">{selectedMember.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedMember.email}
                    </p>
                  </div>
                </>
              )}
            </SheetTitle>
            <SheetDescription className="pt-2">
              View team member&apos;s activity and career goals
            </SheetDescription>
          </SheetHeader>
          {selectedMember && (
            <div className="mt-8 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{selectedMember._count.dailyLogs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Logs</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{selectedMember._count.weeklyReports}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reports</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-semibold">{selectedMember._count.careerGoals}</p>
                  <p className="text-xs text-muted-foreground mt-1">Goals</p>
                </div>
              </div>

              <Separator />

              {/* Recent Reports */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4" />
                  Recent Reports
                </h4>
                {selectedMember.weeklyReports.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMember.weeklyReports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Week {report.weekNumber}, {report.year}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateRange(report.startDate, report.endDate)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={REPORT_STATUS_CONFIG[report.status].color}
                        >
                          {REPORT_STATUS_CONFIG[report.status].label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No reports yet
                  </p>
                )}
              </div>

              <Separator />

              {/* Career Goals */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="size-4" />
                  Career Goals
                </h4>
                {selectedMember.careerGoals.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMember.careerGoals.map((goal) => (
                      <div key={goal.id} className="p-4 rounded-lg border space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium">{goal.title}</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs shrink-0 ${GOAL_STATUS_CONFIG[goal.status].color}`}
                          >
                            {GOAL_STATUS_CONFIG[goal.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {goal.description}
                        </p>
                        {goal.managerComment && (
                          <div className="p-3 rounded bg-muted/50">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              <MessageSquare className="size-3 inline mr-1.5" />
                              Your feedback: {goal.managerComment}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No career goals set
                  </p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
