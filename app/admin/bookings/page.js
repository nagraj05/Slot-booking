'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminLayout } from '@/components/admin/admin-layout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { toast } from 'sonner'
import { Users, Calendar, IndianRupee, MapPin, Search, Filter, Building2, Clock, Mail, User } from 'lucide-react'

export default function AllBookingsPage() {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [stadiums, setStadiums] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [stadiumFilter, setStadiumFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, paymentStatusFilter, bookingStatusFilter, stadiumFilter])

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
      const [bookingsRes, stadiumsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            *,
            slots!inner (*, stadiums (id, name, location)),
            profiles (full_name, email)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('stadiums')
          .select('*')
          .order('name', { ascending: true })
      ])

      if (bookingsRes.data) setBookings(bookingsRes.data)
      if (stadiumsRes.data) setStadiums(stadiumsRes.data)
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

    // Stadium filter
    if (stadiumFilter !== 'all') {
      filtered = filtered.filter(booking => booking.slots?.stadium_id === stadiumFilter)
    }

    setFilteredBookings(filtered)
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTotalRevenue = () => {
    return filteredBookings
      .filter(booking => booking.payment_status === 'paid')
      .reduce((total, booking) => total + parseFloat(booking.total_amount), 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout user={user} stadiumCount={stadiums.length} bookingCount={bookings.length}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Bookings</h1>
          <p className="text-gray-600">Manage all bookings across all your stadiums</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold">{filteredBookings.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Paid Bookings</p>
                  <p className="text-2xl font-bold">
                    {filteredBookings.filter(b => b.payment_status === 'paid').length}
                  </p>
                </div>
                <Badge className="bg-yellow-200 text-yellow-800 border-0">
                  {Math.round((filteredBookings.filter(b => b.payment_status === 'paid').length / filteredBookings.length) * 100) || 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Pending Payments</p>
                  <p className="text-2xl font-bold">
                    {filteredBookings.filter(b => b.payment_status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-orange-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white rounded-lg mx-6 mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search by customer or stadium..."
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
                <label className="text-sm font-medium text-gray-700">Stadium</label>
                <Select value={stadiumFilter} onValueChange={setStadiumFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stadiums</SelectItem>
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

        {/* Bookings List */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-purple-600" />
              Bookings ({filteredBookings.length} of {bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {bookings.length === 0 ? 'Bookings will appear here once customers start booking.' : 'Try adjusting your filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <h4 className="font-medium text-gray-900">{booking.profiles?.full_name}</h4>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {booking.profiles?.email}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 mb-3">
                          <span className="flex items-center gap-2 font-medium">
                            <Building2 className="h-4 w-4 text-purple-500" />
                            {booking.slots?.stadiums?.name}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.slots?.stadiums?.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            {new Date(booking.slots?.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            {formatTime(booking.slots?.start_time)} - {formatTime(booking.slots?.end_time)}
                          </span>
                          <span className="flex items-center gap-2 font-medium text-green-600">
                            <IndianRupee className="h-4 w-4" />
                            ₹{booking.total_amount}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Booked on: {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="space-x-2">
                          <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
                            {booking.payment_status}
                          </Badge>
                          <Badge variant="outline" className={getBookingStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/admin/stadium/${booking.slots?.stadium_id}`)}
                          >
                            View Stadium
                          </Button>
                        </div>
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