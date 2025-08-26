'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { signUp } from '@/lib/auth'
import { toast } from 'sonner'

export function SignupForm({ userType = 'customer' }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: userType
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.userType)
      toast.success('Account created successfully! Please check your email to verify your account.')
      router.push('/login')
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>
          {userType === 'admin' ? 'Business Account' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {userType === 'admin' 
            ? 'Register your stadium and manage bookings' 
            : 'Sign up to start booking stadium slots'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {userType === 'admin' ? 'Business/Stadium Name' : 'Full Name'}
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : (userType === 'admin' ? 'Create Business Account' : 'Create Account')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}