import { cache } from 'react'
import { createClient } from './server'

// One login check and one profile read per request, shared by the layout and the page.
export const getSessionUser = cache(async () => {
  const { data: { user } } = await createClient().auth.getUser()
  return user
})

export const getProfile = cache(async () => {
  const user = await getSessionUser()
  if (!user) return null
  const { data } = await createClient()
    .from('profiles')
    .select('id, role, business_id, email, full_name')
    .eq('id', user.id)
    .maybeSingle()
  return data
})
