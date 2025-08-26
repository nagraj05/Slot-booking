'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { signOut } from '@/lib/auth'
import { toast } from 'sonner'
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  MapPin,
  Clock
} from 'lucide-react'

export function AdminLayout({ children, user, stadiumCount = 0, slotCount = 0, bookingCount = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
    {
      name: "Create Venue",
      href: "/admin/create-venue",
      icon: Building2,
      current: pathname === "/admin/create-venue",
    },
    {
      name: "All Slots",
      href: "/admin/slots",
      icon: Clock,
      current: pathname === "/admin/slots",
    },
  ];

  const stats = [
    { name: 'Venues', value: stadiumCount, icon: Building2, color: 'bg-blue-500' },
    { name: 'Slots', value: slotCount, icon: Clock, color: 'bg-green-500' },
    { name: 'Bookings', value: bookingCount, icon: Users, color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-gray-600 opacity-75 transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex flex-col w-64 h-full bg-white shadow-xl transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
            <h2 className="text-xl font-bold text-white">Venue Admin</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent navigation={navigation} handleSignOut={handleSignOut} user={user} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white shadow-xl">
          <div className="flex items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <Building2 className="h-8 w-8 text-white mr-3" />
            <h2 className="text-xl font-bold text-white">Venue Admin</h2>
          </div>
          <SidebarContent navigation={navigation} handleSignOut={handleSignOut} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-3"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {pathname === '/admin' ? 'Dashboard' : 
                   pathname === '/admin/slots' ? 'All Slots' :
                   pathname === '/admin/create-venue' ? 'Create Venue' :
                   pathname.includes('/venue/') ? 'Venue Management' : 'Admin'}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.profile?.full_name || 'Admin'}
                </p>
              </div>
            </div>

            {/* Stats in header */}
            <div className="hidden md:flex items-center space-x-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className={`p-1 rounded ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation, handleSignOut, user }) {
  return (
    <div className="flex flex-col flex-grow">
      {/* User info */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.profile?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.profile?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-gray-600">{user?.email}</p>
            <Badge variant="secondary" className="text-xs mt-1">Admin</Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign out button */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}