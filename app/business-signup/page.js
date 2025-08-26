import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function BusinessSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-6">
        <SignupForm userType="admin" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have a business account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Looking for customer signup?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Customer signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}