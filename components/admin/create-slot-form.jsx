'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function CreateSlotForm({ stadiumId, stadiumName, onSlotCreated }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    stadiumId: stadiumId,
    date: '',
    startTime: '',
    endTime: '',
    price: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check for overlapping slots first
      const { data: existingSlots, error: checkError } = await supabase
        .from('slots')
        .select('start_time, end_time')
        .eq('stadium_id', formData.stadiumId)
        .eq('date', formData.date)

      if (checkError) throw checkError

      // Check for time overlap
      const newStart = formData.startTime
      const newEnd = formData.endTime
      
      const hasOverlap = existingSlots.some(slot => {
        const existingStart = slot.start_time
        const existingEnd = slot.end_time
        
        return (newStart < existingEnd && newEnd > existingStart)
      })

      if (hasOverlap) {
        toast.error('This time slot overlaps with an existing slot. Please choose a different time.')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('slots')
        .insert({
          stadium_id: formData.stadiumId,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
          day_price: parseFloat(formData.price),
          night_price: parseFloat(formData.price),
          created_by: user.id
        })
        .select()

      if (error) throw error

      toast.success('Slot created successfully!')
      setFormData({ stadiumId: stadiumId, date: '', startTime: '', endTime: '', price: '' })
      setOpen(false)
      onSlotCreated?.()
    } catch (error) {
      toast.error(error.message || 'Failed to create slot')
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
          Create Slot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Slot for {stadiumName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              required
              placeholder="Enter slot price"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Slot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}