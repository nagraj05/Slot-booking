'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminLayout } from '@/components/admin/admin-layout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, IndianRupee, Users, Building2, Search, Filter } from 'lucide-react'

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [stadiums, setStadiums] = useState([])
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [venueFilter, setVenueFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, paymentStatusFilter, bookingStatusFilter, venueFilter])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      const adminStatus = await isAdmin()
      
      if (!currentUser || !adminStatus) {
        router.push('/login')
        return
      }
      
      setUser(currentUser)
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      const [stadiumsRes, slotsRes, bookingsRes] = await Promise.all([
        supabase.from('stadiums').select('*').order('created_at', { ascending: false }),
        supabase.from('slots').select(`
          *,
          stadiums (name, location),
          bookings (id, status, payment_status)
        `).order('date', { ascending: true }),
        supabase.from('bookings').select(`
          *,
          slots!inner (*, stadiums (name, location)),
          profiles (full_name, email)
        `).order('created_at', { ascending: false })
      ])

      if (stadiumsRes.data) setStadiums(stadiumsRes.data)
      if (slotsRes.data) setSlots(slotsRes.data)
      if (bookingsRes.data) {
        setBookings(bookingsRes.data)
        setFilteredBookings(bookingsRes.data)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.slots?.stadiums?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === paymentStatusFilter)
    }

    // Booking status filter
    if (bookingStatusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingStatusFilter)
    }

    // Venue filter
    if (venueFilter !== 'all') {
      filtered = filtered.filter(booking => booking.slots?.stadium_id === venueFilter)
    }

    setFilteredBookings(filtered)
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout 
      user={user}
      stadiumCount={stadiums.length}
      slotCount={slots.length}
      bookingCount={bookings.length}
    >

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">₹{filteredBookings.filter(b => b.payment_status === 'paid').reduce((total, b) => total + parseFloat(b.total_amount), 0).toLocaleString()}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Filtered Bookings</p>
                <p className="text-2xl font-bold">{filteredBookings.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Paid Bookings</p>
                <p className="text-2xl font-bold">{filteredBookings.filter(b => b.payment_status === 'paid').length}</p>
              </div>
              <Badge className="bg-purple-200 text-purple-800 border-0">
                {Math.round((filteredBookings.filter(b => b.payment_status === 'paid').length / filteredBookings.length) * 100) || 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold">{filteredBookings.filter(b => b.payment_status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Filter className="h-5 w-5 text-orange-600" />
            Filter Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white rounded-lg mx-6 mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by customer or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Status</label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Booking Status</label>
              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Venue</label>
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Venues</SelectItem>
                  {stadiums.map((stadium) => (
                    <SelectItem key={stadium.id} value={stadium.id}>
                      {stadium.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* All Bookings */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-purple-600" />
              All Bookings ({filteredBookings.length} of {bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">{bookings.length === 0 ? 'Bookings will appear here once customers start booking your slots.' : 'Try adjusting your filters to see more results.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.profiles?.full_name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{booking.profiles?.email}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 font-medium">
                            <Building2 className="h-4 w-4 text-purple-500" />
                            {booking.slots?.stadiums?.name}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.slots?.stadiums?.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            {new Date(booking.slots?.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-green-500" />
                            {formatTime(booking.slots?.start_time)} - {formatTime(booking.slots?.end_time)}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            <IndianRupee className="h-4 w-4" />
                            ₹{booking.total_amount}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Booked on: {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}
                               className={booking.payment_status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                          {booking.payment_status}
                        </Badge>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} 
                               className={`ml-2 ${booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}`}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}