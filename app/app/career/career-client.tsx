'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Pause,
  Flag,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { formatDate } from '@/lib/date-utils'
import { GOAL_STATUS_CONFIG, type CareerGoal, type GoalStatus } from '@/lib/types'
import { format } from 'date-fns'

interface CareerClientProps {
  goals: CareerGoal[]
}

const statusIcons = {
  NOT_STARTED: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  ON_HOLD: Pause,
}

export function CareerClient({ goals: initialGoals }: CareerClientProps) {
  const [goals, setGoals] = useState(initialGoals)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<CareerGoal | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState<Date | undefined>()
  const [status, setStatus] = useState<GoalStatus>('NOT_STARTED')
  const [isSaving, setIsSaving] = useState(false)
  const [filter, setFilter] = useState<GoalStatus | 'ALL'>('ALL')

  const filteredGoals = filter === 'ALL' 
    ? goals 
    : goals.filter((goal) => goal.status === filter)

  const stats = {
    total: goals.length,
    completed: goals.filter((g) => g.status === 'COMPLETED').length,
    inProgress: goals.filter((g) => g.status === 'IN_PROGRESS').length,
    notStarted: goals.filter((g) => g.status === 'NOT_STARTED').length,
    onHold: goals.filter((g) => g.status === 'ON_HOLD').length,
  }

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTargetDate(undefined)
    setStatus('NOT_STARTED')
    setEditingGoal(null)
    setIsAddingGoal(false)
  }

  const handleAddGoal = async () => {
    if (!title.trim() || !description.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/career-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          targetDate: targetDate?.toISOString() || null,
          status,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGoals([data.goal, ...goals])
        resetForm()
      }
    } catch (error) {
      console.error('Failed to add goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateGoal = async () => {
    if (!editingGoal || !title.trim() || !description.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/career-goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          targetDate: targetDate?.toISOString() || null,
          status,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGoals(goals.map((g) => (g.id === editingGoal.id ? data.goal : g)))
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/career-goals/${goalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGoals(goals.filter((g) => g.id !== goalId))
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const openEditDialog = (goal: CareerGoal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description)
    setTargetDate(goal.targetDate ? new Date(goal.targetDate) : undefined)
    setStatus(goal.status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Path</h1>
          <p className="text-muted-foreground">
            Set and track your career goals and aspirations
          </p>
        </div>
        <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Career Goal</DialogTitle>
              <DialogDescription>
                Define a new career goal you want to achieve
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Master React Native Development"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goal in detail, including specific milestones..."
                  className="min-h-30"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 size-4" />
                        {targetDate ? format(targetDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={targetDate}
                        onSelect={setTargetDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GOAL_STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal} disabled={isSaving || !title.trim() || !description.trim()}>
                {isSaving ? 'Adding...' : 'Add Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Goals</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Circle className="size-5 text-slate-400" />
              <span className="text-sm text-muted-foreground">Not Started</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.notStarted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Pause className="size-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">On Hold</span>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.onHold}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
          <CardDescription>
            Your career goals completion rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={completionPercentage} className="flex-1" />
            <span className="text-lg font-semibold">{completionPercentage}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {stats.completed} of {stats.total} goals completed
          </p>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <div className="flex gap-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
          >
            All
          </Button>
          {Object.entries(GOAL_STATUS_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key as GoalStatus)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => {
            const StatusIcon = statusIcons[goal.status]
            return (
              <Card key={goal.id} className="group relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon
                        className={`size-5 ${
                          goal.status === 'COMPLETED'
                            ? 'text-emerald-500'
                            : goal.status === 'IN_PROGRESS'
                            ? 'text-blue-500'
                            : goal.status === 'ON_HOLD'
                            ? 'text-amber-500'
                            : 'text-slate-400'
                        }`}
                      />
                      <CardTitle className="text-base line-clamp-1">
                        {goal.title}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${GOAL_STATUS_CONFIG[goal.status].color}`}
                    >
                      {GOAL_STATUS_CONFIG[goal.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {goal.description}
                  </p>
                  {goal.targetDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Flag className="size-4 text-muted-foreground" />
                      <span>Target: {formatDate(goal.targetDate)}</span>
                    </div>
                  )}
                  {goal.managerComment && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MessageSquare className="size-4 text-muted-foreground" />
                          Manager Feedback
                        </div>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                          {goal.managerComment}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(goal)}
                    >
                      <Edit className="size-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="size-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No goals found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {filter === 'ALL'
                ? 'Start by adding your first career goal'
                : `No ${GOAL_STATUS_CONFIG[filter as GoalStatus].label.toLowerCase()} goals`}
            </p>
            {filter === 'ALL' && (
              <Button className="mt-4" onClick={() => setIsAddingGoal(true)}>
                <Plus className="size-4 mr-2" />
                Add Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Goal Dialog */}
      <Dialog
        open={!!editingGoal}
        onOpenChange={(open) => {
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Career Goal</DialogTitle>
            <DialogDescription>
              Update your career goal details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Master React Native Development"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal in detail..."
                className="min-h-30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 size-4" />
                      {targetDate ? format(targetDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGoal} disabled={isSaving || !title.trim() || !description.trim()}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
