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
import { Clock, Calendar, IndianRupee, MapPin, Search, Filter, Building2 } from 'lucide-react'

export default function AllSlotsPage() {
  const [user, setUser] = useState(null)
  const [slots, setSlots] = useState([])
  const [stadiums, setStadiums] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stadiumFilter, setStadiumFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  useEffect(() => {
    filterSlots()
  }, [slots, searchTerm, statusFilter, stadiumFilter])

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
      const [slotsRes, stadiumsRes] = await Promise.all([
        supabase
          .from('slots')
          .select(`
            *,
            stadiums (id, name, location),
            bookings!left (id, status, payment_status, profiles (full_name))
          `)
          .order('date', { ascending: true }),
        supabase
          .from('stadiums')
          .select('*')
          .order('name', { ascending: true })
      ])

      if (slotsRes.data) setSlots(slotsRes.data)
      if (stadiumsRes.data) setStadiums(stadiumsRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const filterSlots = () => {
    let filtered = slots

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.stadiums?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.stadiums?.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(slot => {
        const hasActiveBooking = slot.bookings && slot.bookings.length > 0 && 
          slot.bookings.some(booking => booking.status === 'confirmed' && booking.payment_status === 'paid')
        
        if (statusFilter === 'available') return !hasActiveBooking
        if (statusFilter === 'booked') return hasActiveBooking
        return true
      })
    }

    // Stadium filter
    if (stadiumFilter !== 'all') {
      filtered = filtered.filter(slot => slot.stadium_id === stadiumFilter)
    }

    setFilteredSlots(filtered)
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSlotPrice = (slot) => {
    return slot.day_price
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout user={user} stadiumCount={stadiums.length} slotCount={slots.length}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Slots</h1>
          <p className="text-gray-600">Manage all your venue slots across all locations</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-blue-600" />
              Filters
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
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Slots</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Venue</label>
                <Select value={stadiumFilter} onValueChange={setStadiumFilter}>
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

        {/* Slots List */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-green-600" />
                Slots ({filteredSlots.length} of {slots.length})
              </CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {filteredSlots.filter(slot => {
                  const hasActiveBooking = slot.bookings && slot.bookings.length > 0 && 
                    slot.bookings.some(booking => booking.status === 'confirmed' && booking.payment_status === 'paid')
                  return !hasActiveBooking
                }).length} Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No slots found</h3>
                <p className="text-gray-600">
                  {slots.length === 0 ? 'Create your first slot to get started.' : 'Try adjusting your filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSlots.map((slot) => (
                  <div key={slot.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-500" />
                            {slot.stadiums?.name}
                          </h4>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {slot.stadiums?.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            {new Date(slot.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                          <span className="flex items-center gap-2 font-medium text-green-600">
                            <IndianRupee className="h-4 w-4" />
                            ₹{getSlotPrice(slot)}
                          </span>
                        </div>
                        {slot.bookings?.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            Booked by: {slot.bookings[0].profiles?.full_name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {(() => {
                          const hasActiveBooking = slot.bookings && slot.bookings.length > 0 && 
                            slot.bookings.some(booking => booking.status === 'confirmed' && booking.payment_status === 'paid')
                          return (
                            <Badge variant={hasActiveBooking ? 'destructive' : 'outline'} 
                                   className={!hasActiveBooking ? 'border-green-200 text-green-700 bg-green-50' : ''}>
                              {hasActiveBooking ? 'Booked' : 'Available'}
                            </Badge>
                          )
                        })()}
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/admin/venue/${slot.stadium_id}`)}
                          >
                            Manage
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