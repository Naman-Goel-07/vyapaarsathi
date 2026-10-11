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
  
  const email = (formData.get('email') as string).trim().toLowerCase()
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
        .insert({ name: businessName.trim(), owner_id: data.user.id })
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


export async function assignCAToBusiness(
  businessId: string,
  caEmail: string,
  caDisplayName?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized. Please log in.' }

  const trimmedEmail = caEmail.trim().toLowerCase()

  // 1. First attempt via secure database RPC function
  const { data: rpcResult, error: rpcError } = await supabase.rpc('assign_ca_to_business', {
    p_business_id: businessId,
    p_ca_email: trimmedEmail
  })

  if (!rpcError && rpcResult) {
    if (rpcResult.success === false) {
      return { success: false, error: rpcResult.error }
    }
    revalidatePath('/dashboard/owner')
    revalidatePath('/dashboard/ca')
    return {
      success: true,
      ca: {
        id: rpcResult.ca_id,
        email: rpcResult.email,
        name: caDisplayName || rpcResult.full_name || rpcResult.email.split('@')[0].toUpperCase(),
        firm: 'Retained Statutory Counsel'
      }
    }
  }

  // 2. Direct query fallback (case-insensitive)
  const { data: caProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, email, role, full_name')
    .ilike('email', trimmedEmail)
    .maybeSingle()

  if (profileErr) {
    console.error('Error finding CA profile:', profileErr)
  }

  if (!caProfile) {
    return {
      success: false,
      error: `No registered account found with email "${caEmail}". The CA must create an account on VyapaarSathi first.`
    }
  }

  if (caProfile.role !== 'ca') {
    return {
      success: false,
      error: `The account "${caEmail}" is registered as a Business Owner, not a Chartered Accountant. Please enter a registered CA email.`
    }
  }

  // 3. Update businesses table ca_id
  const { error: updateErr } = await supabase
    .from('businesses')
    .update({ ca_id: caProfile.id })
    .eq('id', businessId)

  if (updateErr) {
    return {
      success: false,
      error: 'Failed to update business in database: ' + updateErr.message
    }
  }

  revalidatePath('/dashboard/owner')
  revalidatePath('/dashboard/ca')
  return {
    success: true,
    ca: {
      id: caProfile.id,
      email: caProfile.email,
      name: caDisplayName || caProfile.full_name || caProfile.email.split('@')[0].toUpperCase(),
      firm: 'Retained Statutory Counsel'
    }
  }
}

export async function unassignCAFromBusiness(businessId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('businesses')
    .update({ ca_id: null })
    .eq('id', businessId)

  revalidatePath('/dashboard/owner')
  revalidatePath('/dashboard/ca')
  return { success: !error }
}
