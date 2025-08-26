import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-6">
        <SignupForm userType="customer" />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Own a stadium?{' '}
            <Link href="/business-signup" className="text-blue-600 hover:underline">
              Business signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}