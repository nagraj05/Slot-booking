'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { Clock, IndianRupee, Calendar, MapPin } from 'lucide-react'

export function SlotBookingModal({ stadium, open, onClose, onBookingSuccess }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (stadium && selectedDate) {
      fetchAvailableSlots()
    }
  }, [stadium, selectedDate])

  useEffect(() => {
    if (open) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setSelectedDate(tomorrow.toISOString().split('T')[0])
    }
  }, [open])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      // Fetch slots with booking information to double-check availability
      const { data, error } = await supabase
        .from('slots')
        .select(`
          *,
          bookings!left (id, status, payment_status)
        `)
        .eq('stadium_id', stadium.id)
        .eq('date', selectedDate)
        .order('start_time')

      if (error) throw error
      
      // Filter out slots that have confirmed bookings with paid status
      const availableSlots = data.filter(slot => {
        const hasActiveBooking = slot.bookings && slot.bookings.length > 0 && 
          slot.bookings.some(booking => booking.status === 'confirmed' && booking.payment_status === 'paid')
        return !hasActiveBooking
      })
      
      // Transform data to match the expected format
      const transformedData = availableSlots.map(slot => ({
        ...slot,
        current_price: slot.day_price, // Use day_price as the single price
        is_day_time: true // Not relevant anymore but kept for compatibility
      }))
      
      setAvailableSlots(transformedData || [])
    } catch (error) {
      toast.error('Failed to fetch available slots')
    } finally {
      setLoading(false)
    }
  }

  const handleBookSlot = async () => {
    if (!selectedSlot) return
    
    setBookingLoading(true)
    try {
      const user = await getCurrentUser()
      
      // Create booking and update slot availability in a transaction-like approach
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          slot_id: selectedSlot.id,
          user_id: user.id,
          total_amount: selectedSlot.current_price,
          payment_status: 'pending',
          status: 'confirmed'
        })
        .select()

      if (bookingError) throw bookingError

      // Update slot availability manually to ensure it's marked as unavailable
      const { error: slotError } = await supabase
        .from('slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id)

      if (slotError) {
        // If slot update fails, we should ideally rollback the booking
        console.error('Failed to update slot availability:', slotError)
        // Don't throw error here as booking is already created
      }

      toast.success('Slot booked successfully! Proceed to payment.')
      onBookingSuccess?.(bookingData[0])
      handlePayment(bookingData[0])
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to book slot')
    } finally {
      setBookingLoading(false)
    }
  }

  const handlePayment = async (booking) => {
    const { processPayment } = await import('@/lib/payment')
    toast.success(`Processing payment of ₹${booking.total_amount}...`)
    
    const result = await processPayment(booking.id, booking.total_amount)
    if (result.success) {
      toast.success('Payment successful! Your slot is confirmed.')
    } else {
      toast.error('Payment failed. Please try again.')
    }
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {stadium?.name}
          </DialogTitle>
          <p className="text-sm text-gray-600">{stadium?.location}</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTomorrowDate()}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading available slots...</div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Available Slots for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available slots for this date
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="h-4 w-4" />
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </span>
                            <Badge variant="default">
                              Available
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-lg font-semibold text-green-600">
                              <IndianRupee className="h-4 w-4" />
                              ₹{slot.current_price}
                            </span>
                            <Badge variant="outline" className="text-green-600">
                              Available
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Stadium:</strong> {stadium.name}</p>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}</p>
                <p><strong>Duration:</strong> 3 hours</p>
                <p className="text-lg font-semibold text-green-600">
                  <strong>Total Amount: ₹{selectedSlot.current_price}</strong>
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBookSlot}
              disabled={!selectedSlot || bookingLoading}
              className="flex-1"
            >
              {bookingLoading ? 'Booking...' : 'Book & Pay'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}