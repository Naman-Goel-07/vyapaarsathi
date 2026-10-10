'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Get user role to redirect appropriately
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  revalidatePath('/', 'layout')
  
  if (profile?.role === 'ca') {
    redirect('/dashboard/ca')
  } else {
    redirect('/dashboard/owner')
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string // 'owner' or 'ca'
  const businessName = formData.get('businessName') as string
  
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // If business owner, create business first
    let businessId = null
    if (role === 'owner' && businessName) {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({ name: businessName })
        .select()
        .single()
      
      if (businessError) {
        console.error('Error creating business:', businessError)
        return redirect(`/signup?error=${encodeURIComponent('Database error creating business: ' + businessError.message)}`)
      }

      if (business) businessId = business.id
    }

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      role,
      business_id: businessId
    })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return redirect(`/signup?error=${encodeURIComponent('Database error creating profile: ' + profileError.message)}`)
    }
  }

  revalidatePath('/', 'layout')

  // If email confirmation is disabled, user is immediately logged in
  if (data.session) {
    if (role === 'ca') {
      redirect('/dashboard/ca')
    } else {
      redirect('/dashboard/owner')
    }
  }

  redirect('/login?message=' + encodeURIComponent('Account created! Please check your email to confirm, then sign in.'))
}

export async function switchRole(newRole: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', user.id)

  if (error) {
    console.error('Error switching role:', error)
    return
  }

  revalidatePath('/', 'layout')
  
  if (newRole === 'ca') {
    redirect('/dashboard/ca')
  } else {
    redirect('/dashboard/owner')
  }
}
