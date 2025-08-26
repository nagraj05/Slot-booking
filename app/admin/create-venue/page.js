'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateStadiumForm } from '@/components/admin/create-stadium-form'
import { AdminLayout } from '@/components/admin/admin-layout'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { toast } from 'sonner'
import { MapPin, Plus, TrendingUp, Eye } from 'lucide-react'

export default function CreateVenuePage() {
  const [user, setUser] = useState(null)
  const [stadiums, setStadiums] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

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
      const stadiumsRes = await supabase
        .from('stadiums')
        .select('*')
        .order('created_at', { ascending: false })

      if (stadiumsRes.data) setStadiums(stadiumsRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout user={user} stadiumCount={stadiums.length}>
      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Create New Venue</h2>
        </div>
        <div className="flex gap-4">
          <CreateStadiumForm onStadiumCreated={fetchData} />
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MapPin className="h-5 w-5 text-blue-600" />
                Your Venues ({stadiums.length})
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {stadiums.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stadiums.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No venues yet</h3>
                <p className="text-gray-600 mb-4">Create your first venue to start managing slots and bookings.</p>
                <CreateStadiumForm onStadiumCreated={fetchData} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stadiums.map((stadium) => (
                  <Card key={stadium.id} className="group cursor-pointer hover:shadow-xl transition-all duration-200 border-0 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transform hover:-translate-y-1" 
                        onClick={() => router.push(`/admin/venue/${stadium.id}`)}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{stadium.name}</h3>
                        <Eye className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {stadium.location}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {stadium.facilities?.slice(0, 3).map((facility, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {facility}
                          </Badge>
                        ))}
                        {stadium.facilities?.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                            +{stadium.facilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-600 font-medium group-hover:text-blue-700">Click to manage slots</p>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}