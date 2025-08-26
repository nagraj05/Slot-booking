import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Stadium Slot Booking
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your favorite stadium slots with dynamic pricing. Day and night rates available.
            Easy booking, secure payments, and instant confirmation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Multiple Stadiums</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Choose from a variety of stadiums across different locations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Dynamic Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Day and night pricing with 3-hour slot durations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Simple booking process with real-time availability
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Admin Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Stadium owners can manage venues and track bookings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Stadium</h3>
              <p className="text-gray-600">
                Browse available stadiums and view their facilities and locations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Slot</h3>
              <p className="text-gray-600">
                Pick your preferred date and time with transparent pricing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Pay</h3>
              <p className="text-gray-600">
                Secure booking with instant confirmation and payment
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                Create Account
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Browse Stadiums
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            Own a stadium? Join our platform and manage your venue bookings.
          </p>
          <Link href="/business-signup">
            <Button variant="link" className="text-blue-600 underline">
              Register Your Stadium - Business Signup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
