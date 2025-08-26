import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Users, Shield, Building2, Star, CheckCircle, Calendar } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200 mb-6">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Professional Venue Management</span>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Venue Booking System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover and book premium venues with our comprehensive booking platform. 
            From sports facilities to event spaces - find the perfect venue for your needs with 
            transparent pricing and instant confirmation.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                Start Booking
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800">Multiple Venues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Choose from a diverse range of premium venues across multiple locations and categories
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-800">Smart Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Transparent pricing with 3-hour slot durations and competitive rates
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-purple-800">Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Streamlined booking process with real-time availability and instant confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader>
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">Venue Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive venue management tools for owners and administrators
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-16 border border-white/20">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-emerald-800">Discover Venues</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Browse our curated selection of premium venues with detailed facilities, locations, and high-quality images
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-800">Select Your Slot</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Choose your preferred date and time with our intelligent calendar system and transparent pricing
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-800">Book & Enjoy</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Secure booking with encrypted payments, instant confirmation, and 24/7 customer support
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Why Choose Our Platform?
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Venues</h3>
                  <p className="text-gray-600">All venues are professionally verified with accurate information and facilities</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
                  <p className="text-gray-600">Bank-level security with multiple payment options and instant refunds</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                  <p className="text-gray-600">Live availability updates and instant booking confirmations</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-gray-600">Round-the-clock customer support for all your booking needs</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-3xl p-8 text-center">
            <Star className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Join Thousands of Happy Customers</h3>
            <p className="text-xl text-gray-600 mb-6">
              Over 10,000+ successful bookings and growing every day
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-500 fill-current" />
              ))}
            </div>
            <p className="text-lg font-semibold text-gray-800 mt-2">4.9/5 Average Rating</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Book Your Perfect Venue?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover amazing venues for your next event or activity
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 bg-white text-emerald-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-4 border-white text-black hover:bg-white/20">
                Browse Venues
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer CTA for Venue Owners */}
        <div className="mt-16 pt-8 border-t border-emerald-200 text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-900">Venue Owners</h3>
          </div>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Own a venue? Join our platform and reach thousands of potential customers. 
            Maximize your bookings with our comprehensive venue management tools.
          </p>
          <Link href="/business-signup">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3">
              Register Your Venue - Business Signup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}