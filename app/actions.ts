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

export async function routeNoticeToCABench({
  businessId,
  rawFileUrl,
  fileName,
  notes
}: {
  businessId: string
  rawFileUrl: string
  fileName?: string
  notes?: string
}) {
  const supabase = createClient()
  const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Statutory Document'

  try {
    // 1. Create notice record with zero confidence and raw file attached
    const { data: notice, error: noticeErr } = await supabase
      .from('notices')
      .insert({
        business_id: businessId,
        authority: 'Statutory Authority (Pending CA Verification)',
        form: cleanName,
        issue: notes || `Direct client dispatch (${fileName || 'PDF Document'}). Forwarded directly to CA Bench for manual examination, statutory classification, and reply preparation.`,
        deadline: null,
        raw_file_url: rawFileUrl || null,
        confidence: 0.0,
        status: 'open'
      })
      .select()
      .single()

    if (noticeErr) throw noticeErr

    // 2. Create initial task for the CA Bench
    const { error: taskErr } = await supabase
      .from('tasks')
      .insert({
        notice_id: notice.id,
        action: 'Review original notice PDF in viewer, verify statutory grounds & deadlines, and advise client on response strategy',
        owner_role: 'ca',
        status: 'pending',
        documents_requested: [
          'Full Original Notice Document (PDF Attached)',
          'Relevant Books of Account & Inward/Outward Registers'
        ]
      })

    if (taskErr) throw taskErr

    revalidatePath('/dashboard/owner')
    revalidatePath('/dashboard/ca')
    return { success: true, noticeId: notice.id }
  } catch (err: any) {
    console.error('Error routing notice to CA Bench:', err)
    return { success: false, error: err.message || 'Failed to dispatch docket to CA Bench' }
  }
}

export async function updateNoticeParticulars({
  noticeId,
  authority,
  form,
  issue,
  deadline,
  penaltyAmount
}: {
  noticeId: string
  authority: string
  form: string
  issue: string
  deadline?: string | null
  penaltyAmount?: number
}) {
  const supabase = createClient()

  try {
    let formattedDeadline: string | null = null
    if (deadline) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        formattedDeadline = deadline
      } else {
        const parsed = new Date(deadline)
        if (!isNaN(parsed.getTime())) {
          formattedDeadline = parsed.toISOString().split('T')[0]
        }
      }
    }

    const penaltyNum = typeof penaltyAmount === 'number'
      ? penaltyAmount
      : parseFloat(String(penaltyAmount || 0).replace(/[^0-9.]/g, '')) || 0

    let enrichedIssue = (issue || '').trim()
    if (penaltyNum > 0 && !enrichedIssue.includes(`₹${penaltyNum}`)) {
      enrichedIssue = `[Demand: ₹${penaltyNum.toLocaleString('en-IN')}]\n\n${enrichedIssue}`
    }

    const baseUpdate: any = {
      authority,
      form,
      issue: enrichedIssue,
      deadline: formattedDeadline,
      confidence: 1.0 // Certified by CA / verified
    }

    // Attempt update with penalty_amount column if supported, otherwise fallback
    if (penaltyNum > 0) {
      const { error: dynamicError } = await supabase
        .from('notices')
        .update({ ...baseUpdate, penalty_amount: penaltyNum })
        .eq('id', noticeId)

      if (dynamicError) {
        if (
          dynamicError.message?.includes('penalty_amount') ||
          dynamicError.code === 'PGRST204' ||
          dynamicError.message?.includes('schema cache')
        ) {
          console.warn('notices table lacks penalty_amount column, applying base update:', dynamicError.message)
          const { error: baseError } = await supabase
            .from('notices')
            .update(baseUpdate)
            .eq('id', noticeId)
          if (baseError) throw baseError
        } else {
          throw dynamicError
        }
      }
    } else {
      const { error } = await supabase
        .from('notices')
        .update(baseUpdate)
        .eq('id', noticeId)
      if (error) throw error
    }

    revalidatePath(`/dashboard/notices/${noticeId}`)
    revalidatePath('/dashboard/owner')
    revalidatePath('/dashboard/ca')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating notice particulars:', err)
    return { success: false, error: err.message || 'Failed to update notice particulars' }
  }
}

export async function sealNoticeDocket({
  businessId,
  authority,
  form,
  issue,
  deadline,
  dinNumber,
  penaltyAmount,
  rawFileUrl,
  confidence,
  action,
  ownerRole,
  documents
}: {
  businessId?: string
  authority: string
  form: string
  issue: string
  deadline?: string | null
  dinNumber?: string
  penaltyAmount?: number
  rawFileUrl?: string | null
  confidence?: number
  action?: string
  ownerRole?: 'owner' | 'ca'
  documents?: string[]
}) {
  try {
    const supabase = createClient()
    let effectiveBusinessId = businessId

    // If businessId is not provided or empty, resolve from active user session/profile
    if (!effectiveBusinessId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_id')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.business_id) {
          effectiveBusinessId = profile.business_id
        } else {
          const { data: newBiz } = await supabase
            .from('businesses')
            .insert({ name: 'Enterprise', owner_id: user.id })
            .select()
            .single()

          if (newBiz) {
            effectiveBusinessId = newBiz.id
            await supabase
              .from('profiles')
              .update({ business_id: newBiz.id })
              .eq('id', user.id)
          }
        }
      }
    }

    if (!effectiveBusinessId) {
      return { success: false, error: 'Business account required to seal docket into database. Please log in.' }
    }

    let formattedDeadline: string | null = null
    if (deadline) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        formattedDeadline = deadline
      } else {
        const parsed = new Date(deadline)
        if (!isNaN(parsed.getTime())) {
          formattedDeadline = parsed.toISOString().split('T')[0]
        }
      }
    }

    const penaltyAmountNum = typeof penaltyAmount === 'number'
      ? penaltyAmount
      : parseFloat(String(penaltyAmount || 0).replace(/[^0-9.]/g, '')) || 0

    // Preserve DIN and statutory demand in issue text so downstream views read them dynamically
    let enrichedIssue = (issue || '').trim()
    const tags: string[] = []
    if (dinNumber && !enrichedIssue.includes(dinNumber)) {
      tags.push(`DIN: ${dinNumber}`)
    }
    if (penaltyAmountNum > 0 && !enrichedIssue.includes(`₹${penaltyAmountNum}`)) {
      tags.push(`Demand: ₹${penaltyAmountNum.toLocaleString('en-IN')}`)
    }
    if (tags.length > 0) {
      enrichedIssue = `[${tags.join(' | ')}]\n\n${enrichedIssue}`
    }

    // Guaranteed core table columns
    const basePayload: any = {
      business_id: effectiveBusinessId,
      authority: authority || 'Issuing Authority',
      form: form || 'Statutory Notice',
      issue: enrichedIssue,
      deadline: formattedDeadline,
      raw_file_url: rawFileUrl || null,
      confidence: typeof confidence === 'number' ? confidence : 0.9,
      status: 'open'
    }

    let notice: any = null

    // 1. Dynamic insert with automatic schema compatibility fallback
    if (penaltyAmountNum > 0 || dinNumber) {
      const dynamicPayload: any = { ...basePayload }
      if (penaltyAmountNum > 0) dynamicPayload.penalty_amount = penaltyAmountNum
      if (dinNumber) dynamicPayload.din_number = dinNumber

      const { data, error } = await supabase
        .from('notices')
        .insert(dynamicPayload)
        .select()
        .single()

      if (!error && data) {
        notice = data
      } else if (
        error &&
        (error.message?.includes('penalty_amount') ||
         error.message?.includes('din_number') ||
         error.code === 'PGRST204' ||
         error.message?.includes('schema cache'))
      ) {
        console.warn('notices table lacks penalty_amount/din_number column in schema cache. Inserting base schema with enriched metadata:', error.message)
        const fallback = await supabase
          .from('notices')
          .insert(basePayload)
          .select()
          .single()

        if (fallback.error) throw fallback.error
        notice = fallback.data
      } else if (error) {
        throw error
      }
    } else {
      const { data, error } = await supabase
        .from('notices')
        .insert(basePayload)
        .select()
        .single()

      if (error) throw error
      notice = data
    }

    if (!notice?.id) {
      throw new Error('Notice docket was sealed but returned an empty identifier.')
    }

    // 2. Insert initial task record for CA or Owner
    const { error: taskErr } = await supabase
      .from('tasks')
      .insert({
        notice_id: notice.id,
        action: action || 'Prepare and submit statutory response',
        owner_role: ownerRole || 'ca',
        documents_requested: documents || [],
        status: 'pending'
      })

    if (taskErr) {
      console.warn('Warning: Non-fatal task registration error:', taskErr)
    }

    revalidatePath('/dashboard/owner')
    revalidatePath('/dashboard/ca')
    return { success: true, noticeId: notice.id }
  } catch (err: any) {
    console.error('Error in sealNoticeDocket:', err)
    return { success: false, error: err.message || 'Failed to seal docket into database' }
  }
}



