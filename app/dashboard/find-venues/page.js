'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DirectSlotBookingModal } from '@/components/user/direct-slot-booking-modal'
import { UserLayout } from '@/components/user/user-layout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { Calendar, Clock, IndianRupee, MapPin, Search, Filter, Building2, Star } from 'lucide-react'

export default function FindVenuesPage() {
  const [user, setUser] = useState(null)
  const [slots, setSlots] = useState([])
  const [venues, setVenues] = useState([])
  const [filteredSlots, setFilteredSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  useEffect(() => {
    filterSlots()
  }, [slots, searchTerm, locationFilter, availabilityFilter, dateFilter, minPrice, maxPrice])

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
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
      const [slotsRes, venuesRes] = await Promise.all([
        supabase
          .from('slots')
          .select(`
            *,
            stadiums (id, name, location, facilities)
          `)
          .order('date', { ascending: true }),
        supabase
          .from('stadiums')
          .select('*')
          .order('name', { ascending: true })
      ])

      if (slotsRes.data) {
        setSlots(slotsRes.data)
        // Set initial price range based on actual data
        const prices = slotsRes.data.map(slot => parseFloat(slot.day_price)).filter(price => !isNaN(price))
        if (prices.length > 0) {
          const minPriceData = Math.min(...prices)
          const maxPriceData = Math.max(...prices)
          setMinPrice(minPriceData)
          setMaxPrice(maxPriceData)
        }
      }
      if (venuesRes.data) setVenues(venuesRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const filterSlots = () => {
    let filtered = slots

    // Search filter (venue name)
    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.stadiums?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(slot =>
        slot.stadiums?.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (availabilityFilter === 'available') {
        filtered = filtered.filter(slot => slot.is_available)
      } else if (availabilityFilter === 'booked') {
        filtered = filtered.filter(slot => !slot.is_available)
      }
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(slot => slot.date === dateFilter)
    }

    // Price range filter
    filtered = filtered.filter(slot => {
      const price = parseFloat(slot.day_price)
      return price >= minPrice && price <= maxPrice
    })

    setFilteredSlots(filtered)
  }

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleBookSlot = (slot) => {
    if (!slot.is_available) {
      toast.error('This slot is no longer available')
      return
    }
    setSelectedSlot(slot)
    setShowBookingModal(true)
  }

  const handleBookingSuccess = () => {
    fetchData() // Refresh data after successful booking
    setShowBookingModal(false)
  }

  const getUniqueLocations = () => {
    const locations = [...new Set(venues.map(venue => venue.location).filter(Boolean))]
    return locations
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <UserLayout user={user} venueCount={venues.length}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Find Venues
          </h1>
          <p className="text-gray-600">Discover and book available slots at amazing venues</p>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-emerald-600" />
              Search & Filter Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white rounded-lg mx-6 mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Venues</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search by venue name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {getUniqueLocations().map((location) => (
                      <SelectItem key={location} value={location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Availability</label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Slots</SelectItem>
                    <SelectItem value="available">Available Only</SelectItem>
                    <SelectItem value="booked">Booked Slots</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Price Range: ₹{minPrice} - ₹{maxPrice}
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                      min="0"
                      className="w-full"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value) || 5000)}
                      min="0"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Building2 className="h-5 w-5 text-purple-600" />
                Available Slots ({filteredSlots.length} of {slots.length})
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {filteredSlots.filter(slot => slot.is_available).length} Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No slots found</h3>
                <p className="text-gray-600">
                  {slots.length === 0 ? 'No venues available at the moment.' : 'Try adjusting your filters to find more options.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSlots.map((slot) => (
                  <Card key={slot.id} className={`group transition-all duration-200 hover:shadow-lg border-0 ${
                    slot.is_available 
                      ? 'bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 cursor-pointer' 
                      : 'bg-gray-50 opacity-75'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {slot.stadiums?.name}
                            </h4>
                            <Badge 
                              variant={slot.is_available ? 'outline' : 'secondary'}
                              className={slot.is_available 
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50' 
                                : 'bg-gray-200 text-gray-600'
                              }
                            >
                              {slot.is_available ? 'Available' : 'Booked'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{slot.stadiums?.location}</span>
                          </div>

                          <div className="flex items-center gap-6 mb-3">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">
                                {new Date(slot.date).toLocaleDateString()}
                              </span>
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </span>
                            </span>
                          </div>

                          {slot.stadiums?.facilities && slot.stadiums.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {slot.stadiums.facilities.slice(0, 3).map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
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

                        <div className="text-right">
                          <div className="flex items-center gap-2 font-bold text-green-600 mb-3">
                            <IndianRupee className="h-5 w-5" />
                            <span className="text-xl">₹{slot.day_price}</span>
                          </div>
                          
                          {slot.is_available ? (
                            <Button 
                              onClick={() => handleBookSlot(slot)}
                              className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 w-full"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Book Now
                            </Button>
                          ) : (
                            <Button variant="outline" disabled className="w-full">
                              Not Available
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DirectSlotBookingModal
        slot={selectedSlot}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </UserLayout>
  )
}