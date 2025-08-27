'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { Clock, IndianRupee, Calendar, MapPin, Building2 } from 'lucide-react'

export function DirectSlotBookingModal({ slot, open, onClose, onBookingSuccess }) {
  const [bookingLoading, setBookingLoading] = useState(false)

  const handleBookSlot = async () => {
    if (!slot) return
    
    setBookingLoading(true)
    try {
      const user = await getCurrentUser()
      
      // Create booking and update slot availability
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          slot_id: slot.id,
          user_id: user.id,
          total_amount: slot.day_price,
          payment_status: 'pending',
          status: 'confirmed'
        })
        .select()

      if (bookingError) throw bookingError

      // Update slot availability manually to ensure it's marked as unavailable
      const { error: slotError } = await supabase
        .from('slots')
        .update({ is_available: false })
        .eq('id', slot.id)

      if (slotError) {
        console.error('Failed to update slot availability:', slotError)
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

  if (!slot) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Book Slot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Venue Info */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{slot.stadiums?.name}</h3>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{slot.stadiums?.location}</span>
            </div>
            
            {slot.stadiums?.facilities && slot.stadiums.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {slot.stadiums.facilities.slice(0, 3).map((facility, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                    {facility}
                  </Badge>
                ))}
                {slot.stadiums.facilities.length > 3 && (
                  <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                    +{slot.stadiums.facilities.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Slot Details */}
          <div className="p-3 bg-white border rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Slot Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="font-medium">{new Date(slot.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-medium">3 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Available
                </Badge>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Booking Summary</h4>
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                ₹{slot.day_price}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Payment will be processed after booking confirmation
            </p>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex gap-3 mt-4 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleBookSlot}
            disabled={bookingLoading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700"
          >
            {bookingLoading ? 'Booking...' : 'Book & Pay'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}