'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, IndianRupee } from 'lucide-react'

import { Star, Users } from 'lucide-react'

export function VenueCard({ venue, onViewSlots }) {
  return (
    <Card className="group h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50 transform hover:-translate-y-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
            {venue.name}
          </span>
          <Star className="h-5 w-5 text-amber-400" />
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-gray-600">
          <MapPin className="h-4 w-4 text-emerald-500" />
          {venue.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {venue.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
        )}
        
        {venue.facilities && venue.facilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">Facilities</h4>
            <div className="flex flex-wrap gap-1">
              {venue.facilities.slice(0, 3).map((facility, index) => (
                <Badge key={index} variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                  {facility}
                </Badge>
              ))}
              {venue.facilities.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                  +{venue.facilities.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            onClick={() => onViewSlots(venue)} 
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Users className="h-4 w-4 mr-2" />
            View Available Slots
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}