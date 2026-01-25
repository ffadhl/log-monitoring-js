'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import lotteImg from '@/public/assets/images/lotte_chemical_horizontal.png'

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
    <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={lotteImg}
            alt="PT Lotte Chemical Indonesia"
            width={180}
            height={40}
            className="object-contain"
            priority
          />
          <div className="h-6 w-px bg-gray-300" />
          <span className="text-lg font-semibold text-gray-700">Log Monitoring</span>
          {user.role === 'ADMIN' && (
            <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100">
              Admin
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role === 'ADMIN' ? 'Administrator' : 'Karyawan'}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </nav>
  )
}
