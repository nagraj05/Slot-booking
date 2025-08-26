'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateSlotForm } from '@/components/admin/create-slot-form'
import { AdminLayout } from '@/components/admin/admin-layout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, Clock, IndianRupee, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

export default function StadiumDetailPage() {
  const [user, setUser] = useState(null)
  const [stadium, setStadium] = useState(null)
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    checkAuth()
    if (params.id) {
      fetchStadiumData()
    }
  }, [params.id])

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

  const fetchStadiumData = async () => {
    try {
      const [stadiumRes, slotsRes, bookingsRes] = await Promise.all([
        supabase
          .from('stadiums')
          .select('*')
          .eq('id', params.id)
          .single(),
        supabase
          .from('slots')
          .select('*')
          .eq('stadium_id', params.id)
          .order('date', { ascending: true }),
        supabase
          .from('bookings')
          .select(`
            *,
            slots!inner (*),
            profiles (full_name, email)
          `)
          .eq('slots.stadium_id', params.id)
          .order('created_at', { ascending: false })
      ])

      if (stadiumRes.data) setStadium(stadiumRes.data)
      if (slotsRes.data) setSlots(slotsRes.data)
      if (bookingsRes.data) setBookings(bookingsRes.data)
    } catch (error) {
      toast.error('Failed to fetch stadium data')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSlotPrice = (slot) => {
    return slot.day_price // Since we're using the same price for both day and night now
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stadium) {
    return (
      <AdminLayout user={user}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Stadium not found</h1>
          <p className="text-gray-600 mb-6">The stadium you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/admin">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user}>
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{stadium.name}</h1>
          <p className="flex items-center gap-1 text-blue-100">
            <MapPin className="h-4 w-4" />
            {stadium.location}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-gray-800">Stadium Information</CardTitle>
          </CardHeader>
          <CardContent className="bg-white rounded-lg mx-6 mb-6 p-6">
            <div className="space-y-4">
              {stadium.description && (
                <p className="text-gray-600">{stadium.description}</p>
              )}
              {stadium.facilities && stadium.facilities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-800">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {stadium.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline" className="border-green-200 text-green-700 bg-green-50">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-purple-600" />
                Slots ({slots.length})
              </CardTitle>
              <CreateSlotForm 
                stadiumId={stadium.id} 
                stadiumName={stadium.name}
                onSlotCreated={fetchStadiumData} 
              />
            </div>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No slots created yet</h3>
                <p className="text-gray-600 mb-4">Create your first slot to start accepting bookings.</p>
                <CreateSlotForm 
                  stadiumId={stadium.id} 
                  stadiumName={stadium.name}
                  onSlotCreated={fetchStadiumData} 
                />
              </div>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          {new Date(slot.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-green-500" />
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </span>
                        <span className="flex items-center gap-2 font-medium text-green-600">
                          <IndianRupee className="h-4 w-4" />
                          ₹{getSlotPrice(slot)}
                        </span>
                      </div>
                    </div>
                    <Badge variant={slot.is_available ? 'outline' : 'destructive'} 
                           className={slot.is_available ? 'border-green-200 text-green-700 bg-green-50' : ''}>
                      {slot.is_available ? 'Available' : 'Booked'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-orange-600" />
              Bookings ({bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Bookings will appear here once customers start booking your slots.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {booking.profiles?.full_name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{booking.profiles?.email}</p>
                        <div className="flex items-center gap-4 text-sm">
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