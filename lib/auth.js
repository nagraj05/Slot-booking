import { supabase } from './supabase'

export async function signUp(email, password, fullName, userType = 'customer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      },
    },
  })

  if (error) throw error

  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        user_type: userType,
      })
  }

  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return { ...user, profile }
  }
  
  return null
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.profile?.user_type === 'admin'
}