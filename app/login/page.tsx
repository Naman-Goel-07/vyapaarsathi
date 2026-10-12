import { login } from '../actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; error: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'ca') {
      redirect('/dashboard/ca')
    } else {
      redirect('/dashboard/owner')
    }
  }

  return <LoginForm loginAction={login} searchParams={searchParams} />
}
