'use client'

import * as React from 'react'
import { useState, useRef } from 'react'
import {
  Plus,
  Calendar,
  FileText,
  Send,
  Save,
  Paperclip,
  Trash2,
  Edit,
  MessageSquare,
  CheckCircle,
  Upload,
  Loader2,
  X,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate, formatDateRange, getDayName, isSameDayCheck } from '@/lib/date-utils'
import { MOOD_OPTIONS, REPORT_STATUS_CONFIG, type DailyLog, type WeeklyReport } from '@/lib/types'

interface WeekOption {
  weekNumber: number
  year: number
  startDate: string
  endDate: string
  isCurrent: boolean
}

interface LogsClientProps {
  weekInfo: {
    weekNumber: number
    year: number
    startDate: string
    endDate: string
  }
  weeklyReport: WeeklyReport | null
  dailyLogs: DailyLog[]
  daysInWeek: string[]
  availableWeeks: WeekOption[]
}

export function LogsClient({
  weekInfo,
  weeklyReport,
  dailyLogs,
  daysInWeek,
  availableWeeks,
}: LogsClientProps) {
  const [isAddingLog, setIsAddingLog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [logContent, setLogContent] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null)
  const [summary, setSummary] = useState(weeklyReport?.summary || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentWeekInfo] = useState(weekInfo)
  const [currentLogs, setCurrentLogs] = useState(dailyLogs)
  const [currentReport, setCurrentReport] = useState(weeklyReport)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getLogsForDay = (dayStr: string) => {
    return currentLogs.filter((log) => isSameDayCheck(log.date, dayStr))
  }

  const handleAddLog = async () => {
    if (!selectedDate || !logContent.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          content: logContent,
          mood: selectedMood || null,
          weekNumber: currentWeekInfo.weekNumber,
          year: currentWeekInfo.year,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentLogs([...currentLogs, data.log])
        if (data.weeklyReport) {
          setCurrentReport(data.weeklyReport)
        }
        setIsAddingLog(false)
        setLogContent('')
        setSelectedMood('')
        setSelectedDate(null)
      }
    } catch (error) {
      console.error('Failed to add log:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateLog = async () => {
    if (!editingLog || !logContent.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/daily-logs/${editingLog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: logContent,
          mood: selectedMood || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentLogs(currentLogs.map((log) =>
          log.id === editingLog.id ? data.log : log
        ))
        setEditingLog(null)
        setLogContent('')
        setSelectedMood('')
      }
    } catch (error) {
      console.error('Failed to update log:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    try {
      const response = await fetch(`/api/daily-logs/${logId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCurrentLogs(currentLogs.filter((log) => log.id !== logId))
      }
    } catch (error) {
      console.error('Failed to delete log:', error)
    }
  }

  const handleSaveSummary = async () => {
    if (!currentReport) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/weekly-reports/${currentReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentReport(data.report)
      }
    } catch (error) {
      console.error('Failed to save summary:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!currentReport) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/weekly-reports/${currentReport.id}/submit`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentReport(data.report)
      }
    } catch (error) {
      console.error('Failed to submit report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (log: DailyLog) => {
    setEditingLog(log)
    setLogContent(log.content)
    setSelectedMood(log.mood || '')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentReport) return

    setIsUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" terlalu besar. Maksimal 10MB.`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/weekly-reports/${currentReport.id}/attachments`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentReport({
            ...currentReport,
            attachments: [...(currentReport.attachments || []), data.attachment],
          })
        } else {
          const error = await response.json()
          alert(error.error || 'Gagal upload file')
        }
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Gagal upload file')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!currentReport) return
    
    try {
      const response = await fetch(`/api/weekly-reports/${currentReport.id}/attachments?attachmentId=${attachmentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCurrentReport({
          ...currentReport,
          attachments: currentReport.attachments?.filter(a => a.id !== attachmentId) || [],
        })
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error)
    }
  }

  const completionPercentage = (currentLogs.length / 7) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Logs</h1>
          <p className="text-muted-foreground">
            Track your daily learning and activities
          </p>
        </div>
      </div>

      {/* Week Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Week</CardTitle>
          <CardDescription>
            Choose a week to view your logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {availableWeeks.map((week) => (
                <Button
                  key={`${week.year}-${week.weekNumber}`}
                  variant={currentWeekInfo.weekNumber === week.weekNumber && currentWeekInfo.year === week.year ? 'default' : 'outline'}
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    const params = new URLSearchParams({
                      week: String(week.weekNumber),
                      year: String(week.year),
                    })
                    window.location.href = `/app/logs?${params.toString()}`
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      Week {week.weekNumber}, {week.year}
                      {week.isCurrent && <span className="ml-2 text-xs bg-primary/20 px-2 py-0.5 rounded">Current</span>}
                    </span>
                    <span className={`text-xs ${currentWeekInfo.weekNumber === week.weekNumber && currentWeekInfo.year === week.year ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {formatDateRange(week.startDate, week.endDate)}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily" className="gap-2">
            <Calendar className="size-4" />
            Daily View
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <FileText className="size-4" />
            Weekly Summary
          </TabsTrigger>
        </TabsList>

        {/* Daily View Tab */}
        <TabsContent value="daily" className="space-y-6">
          {/* Days Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {daysInWeek.map((day) => {
              const dayLogs = getLogsForDay(day)
              const dayDate = new Date(day)
              const isToday = isSameDayCheck(new Date(), day)

              return (
                <Card
                  key={day}
                  className={`${isToday ? 'border-primary ring-1 ring-primary' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {getDayName(dayDate)}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(dayDate, 'MMM d')}
                        </CardDescription>
                      </div>
                      {isToday && (
                        <Badge variant="default" className="text-xs">
                          Today
                        </Badge>
                      )}
                      {dayLogs.length > 0 && !isToday && (
                        <CheckCircle className="size-5 text-emerald-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dayLogs.length > 0 ? (
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {dayLogs.map((log) => (
                            <div
                              key={log.id}
                              className="p-2 rounded-lg bg-muted/50 group relative"
                            >
                              <div className="flex items-start gap-2">
                                {log.mood && (
                                  <span className="text-lg">{log.mood}</span>
                                )}
                                <p className="text-sm line-clamp-3 flex-1">
                                  {log.content}
                                </p>
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  onClick={() => openEditDialog(log)}
                                >
                                  <Edit className="size-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 text-destructive"
                                  onClick={() => handleDeleteLog(log.id)}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-muted-foreground">
                        <span className="text-sm">No logs yet</span>
                      </div>
                    )}
                    <Dialog
                      open={isAddingLog && selectedDate === day}
                      onOpenChange={(open) => {
                        if (open) {
                          setSelectedDate(day)
                          setIsAddingLog(true)
                        } else {
                          setIsAddingLog(false)
                          setSelectedDate(null)
                          setLogContent('')
                          setSelectedMood('')
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={currentReport?.status === 'SUBMITTED' || currentReport?.status === 'REVIEWED'}
                        >
                          <Plus className="size-4 mr-1" />
                          Add Log
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Add Log for {getDayName(dayDate)}, {formatDate(dayDate, 'MMM d')}
                          </DialogTitle>
                          <DialogDescription>
                            Record your learning activities and achievements
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>How are you feeling?</Label>
                            <Select
                              value={selectedMood}
                              onValueChange={setSelectedMood}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select mood (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                {MOOD_OPTIONS.map((mood) => (
                                  <SelectItem key={mood.value} value={mood.value}>
                                    {mood.value} {mood.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>What did you learn or accomplish today?</Label>
                            <Textarea
                              value={logContent}
                              onChange={(e) => setLogContent(e.target.value)}
                              placeholder="Describe your activities, learnings, achievements..."
                              className="min-h-37.5"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddingLog(false)
                              setSelectedDate(null)
                              setLogContent('')
                              setSelectedMood('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddLog} disabled={isSaving || !logContent.trim()}>
                            {isSaving ? 'Saving...' : 'Save Log'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Weekly Summary Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Summary Editor */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Summary</CardTitle>
                    <CardDescription>
                      Summarize your key achievements and learnings this week
                    </CardDescription>
                  </div>
                  {currentReport && (
                    <Badge
                      variant="secondary"
                      className={REPORT_STATUS_CONFIG[currentReport.status].color}
                    >
                      {REPORT_STATUS_CONFIG[currentReport.status].label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a summary of your week - key achievements, challenges faced, skills developed..."
                  className="min-h-50"
                  disabled={currentReport?.status === 'SUBMITTED' || currentReport?.status === 'REVIEWED'}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleSaveSummary}
                    disabled={isSaving || !currentReport || currentReport.status !== 'DRAFT'}
                  >
                    <Save className="size-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button
                    onClick={handleSubmitReport}
                    disabled={isSubmitting || !currentReport || currentReport.status !== 'DRAFT' || currentLogs.length === 0}
                  >
                    <Send className="size-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit to Manager'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Week Stats & Manager Feedback */}
            <div className="space-y-6">
              {/* Week Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Week Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Daily Logs</span>
                    <span className="font-medium">{currentLogs.length} / 7</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attachments</span>
                    <span className="font-medium">
                      {currentReport?.attachments?.length || 0}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className={
                        currentReport
                          ? REPORT_STATUS_CONFIG[currentReport.status].color
                          : 'bg-slate-100 text-slate-700'
                      }
                    >
                      {currentReport
                        ? REPORT_STATUS_CONFIG[currentReport.status].label
                        : 'Not Started'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Manager Feedback */}
              {currentReport?.managerFeedback && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      Manager Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentReport.managerFeedback}</p>
                  </CardContent>
                </Card>
              )}

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Paperclip className="size-4" />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport?.attachments && currentReport.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {currentReport.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 group"
                        >
                          <FileText className="size-4 text-muted-foreground" />
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm truncate flex-1 hover:underline"
                          >
                            {attachment.fileName}
                          </a>
                          {currentReport.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                            >
                              <X className="size-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No attachments yet
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    disabled={!currentReport || currentReport.status !== 'DRAFT' || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-4 mr-1 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-1" />
                        Add Attachment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Log Dialog */}
      <Dialog
        open={!!editingLog}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLog(null)
            setLogContent('')
            setSelectedMood('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Log</DialogTitle>
            <DialogDescription>
              Update your log entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mood</Label>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.value} {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                placeholder="Describe your activities..."
                className="min-h-37.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingLog(null)
                setLogContent('')
                setSelectedMood('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateLog} disabled={isSaving || !logContent.trim()}>
              {isSaving ? 'Saving...' : 'Update Log'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
