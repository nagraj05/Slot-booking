'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function CreateStadiumForm({ onStadiumCreated }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    facilities: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('stadiums')
        .insert({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f),
          created_by: user.id
        })
        .select()

      if (error) throw error

      toast.success('Venue created successfully!')
      setFormData({ name: '', description: '', location: '', facilities: '' })
      setOpen(false)
      onStadiumCreated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to create venue')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Venue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Venue Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilities">Facilities (comma separated)</Label>
            <Input
              id="facilities"
              value={formData.facilities}
              onChange={(e) => handleInputChange('facilities', e.target.value)}
              placeholder="Parking, Restrooms, Lighting, etc."
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Venue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}