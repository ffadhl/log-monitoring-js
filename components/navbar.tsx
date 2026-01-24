'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, LayoutDashboard } from 'lucide-react'

interface NavbarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-bold text-white">Log Monitor</span>
          {user.role === 'ADMIN' && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
              Admin
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-4 h-4" />
            <span className="text-sm">{user.name}</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </nav>
  )
}
