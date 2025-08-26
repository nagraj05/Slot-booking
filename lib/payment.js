import { supabase } from './supabase'

export async function processPayment(bookingId, amount) {
  // Dummy payment - simulate payment processing
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .update({ 
            payment_status: 'paid',
            payment_id: `dummy_pay_${Date.now()}_${bookingId.slice(0, 8)}`
          })
          .eq('id', bookingId)
          .select()

        if (error) throw error
        
        resolve({ success: true, data: data[0] })
      } catch (error) {
        resolve({ success: false, error: error.message })
      }
    }, 2000) // 2 second delay to simulate payment processing
  })
}