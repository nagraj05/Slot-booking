'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserLayout } from '@/components/user/user-layout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, IndianRupee, Star, TrendingUp, Settings, Search, Filter, Users } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [venues, setVenues] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [myBookings, searchTerm, paymentStatusFilter, bookingStatusFilter])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      const adminStatus = await isAdmin()
      
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      setUser(currentUser)
      setIsUserAdmin(adminStatus)
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchData = async () => {
    try {
      const [venuesRes, bookingsRes] = await Promise.all([
        supabase.from('stadiums').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select(`
          *,
          slots (*, stadiums (name, location))
        `).eq('user_id', (await getCurrentUser())?.id).order('created_at', { ascending: false })
      ])

      if (venuesRes.data) setVenues(venuesRes.data)
      if (bookingsRes.data) {
        setMyBookings(bookingsRes.data)
        setFilteredBookings(bookingsRes.data)
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }


  const filterBookings = () => {
    let filtered = myBookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.slots?.stadiums?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.slots?.stadiums?.location.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredBookings(filtered)
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTotalSpent = () => {
    return filteredBookings
      .filter(booking => booking.payment_status === 'paid')
      .reduce((total, booking) => total + parseFloat(booking.total_amount), 0)
  }

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split('T')[0]
    return filteredBookings.filter(booking => 
      booking.slots?.date >= today && booking.status === 'confirmed'
    ).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <UserLayout 
      user={user}
      venueCount={venues.length}
      bookingCount={myBookings.length}
    >
      {/* Admin Panel Link */}
      {isUserAdmin && (
        <div className="mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-amber-800">Admin Access Available</h3>
                  <p className="text-sm text-amber-600">You have administrator privileges. Access the admin panel to manage venues.</p>
                </div>
                <Link href="/admin">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8">

        {/* KPI Cards */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Booking Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold">₹{getTotalSpent().toLocaleString()}</p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">My Bookings</p>
                    <p className="text-2xl font-bold">{filteredBookings.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Upcoming</p>
                    <p className="text-2xl font-bold">{getUpcomingBookings()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Filter className="h-5 w-5 text-orange-600" />
                Filter My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white rounded-lg mx-6 mb-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search by venue name or location..."
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
              </div>
            </CardContent>
          </Card>
        </section>

        {/* My Bookings List */}
        <section>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Users className="h-5 w-5 text-blue-600" />
                My Bookings ({filteredBookings.length} of {myBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600 mb-4">
                    {myBookings.length === 0 ? 'Start exploring venues and make your first booking!' : 'Try adjusting your filters to see more results.'}
                  </p>
                  {myBookings.length === 0 && (
                    <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700">
                      <Star className="h-4 w-4 mr-2" />
                      Browse Venues
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-lg text-gray-900">{booking.slots?.stadiums?.name}</h4>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-gray-600">{booking.slots?.stadiums?.location}</span>
                          </div>

                          <div className="flex items-center gap-6 mb-3">
                            <span className="flex items-center gap-2 font-medium">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              {new Date(booking.slots?.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              {formatTime(booking.slots?.start_time)} - {formatTime(booking.slots?.end_time)}
                            </span>
                            <span className="flex items-center gap-2 font-bold text-green-600">
                              <IndianRupee className="h-4 w-4" />
                              ₹{booking.total_amount}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Booked on: {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="space-x-2">
                            <Badge 
                              variant="outline" 
                              className={booking.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : booking.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'}
                            >
                              {booking.payment_status}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={booking.status === 'confirmed' 
                                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                : booking.status === 'completed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-100 text-red-700 border-red-200'}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                          {booking.status === 'confirmed' && new Date(booking.slots?.date) > new Date() && (
                            <div>
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                                Upcoming
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

    </UserLayout>
  )
}