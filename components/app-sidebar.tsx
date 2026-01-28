'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Users,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck,
  Activity,
  BarChart3,
  UserCog,
  Database,
  FileSearch,
  Cog,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface AppSidebarProps {
  user: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  }
  children: React.ReactNode
}

// Employee menu items
const employeeNavItems = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Logs',
    url: '/app/logs',
    icon: BookOpen,
  },
  {
    title: 'Career Path',
    url: '/app/career',
    icon: Target,
  },
]

// Manager menu items  
const managerNavItems = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Team Activity',
    url: '/app/team-review',
    icon: Activity,
  },
  {
    title: 'Team Performance',
    url: '/app/team-performance',
    icon: BarChart3,
  },
  {
    title: 'My Team',
    url: '/app/my-team',
    icon: Users,
  },
]

// Admin menu items
const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    url: '/app/admin',
    icon: UserCog,
  },
  {
    title: 'Master Data',
    url: '/app/master-data',
    icon: Database,
  },
  {
    title: 'Audit Trails',
    url: '/app/audit-trails',
    icon: FileSearch,
  },
  {
    title: 'App Settings',
    url: '/app/app-settings',
    icon: Cog,
  },
]

export function AppSidebar({ user, children }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isActive = (url: string) => {
    if (url === '/app/dashboard') return pathname === '/app/dashboard'
    return pathname.startsWith(url)
  }

  // Get menu items based on role
  const getNavItems = () => {
    if (user.role === 'ADMIN') return adminNavItems
    if (user.role === 'MANAGER') return managerNavItems
    return employeeNavItems
  }

  const navItems = getNavItems()

  // Get role display name
  const getRoleDisplayName = () => {
    if (user.role === 'ADMIN') return 'Super Admin'
    if (user.role === 'MANAGER') return 'Manager'
    return 'Employee'
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent">
                <Link href="/app/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-white">
                    <Image 
                      src="/assets/images/logo_lotte_only.png" 
                      alt="Lotte Chemical" 
                      width={32} 
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Lotte Chemical</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Activity & Mentoring
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronRight className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {getRoleDisplayName()}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/app/settings" className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {formatPathname(pathname)}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function formatPathname(pathname: string): string {
  if (pathname === '/app/dashboard') return 'Dashboard'
  if (pathname === '/app/logs') return 'My Logs'
  if (pathname.startsWith('/app/logs/')) return 'Log Details'
  if (pathname === '/app/career') return 'Career Path'
  if (pathname === '/app/team-review') return 'Team Activity'
  if (pathname.startsWith('/app/team-review/')) return 'Activity Details'
  if (pathname === '/app/team-performance') return 'Team Performance'
  if (pathname === '/app/my-team') return 'My Team'
  if (pathname === '/app/settings') return 'Settings'
  if (pathname === '/app/admin') return 'User Management'
  if (pathname === '/app/master-data') return 'Master Data'
  if (pathname === '/app/audit-trails') return 'Audit Trails'
  if (pathname === '/app/app-settings') return 'App Settings'
  return pathname
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' / ')
}
