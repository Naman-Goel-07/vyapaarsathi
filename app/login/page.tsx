import { login } from '../actions'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:max-w-md justify-center gap-2 mx-auto min-h-screen py-12 bg-paper text-ink">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-ink mb-6 font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Home
      </Link>

      <div className="bg-white p-8 rounded-sm shadow-sm border-2 border-ink">
        <form className="flex flex-col w-full gap-4" action={login}>
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold font-serif text-ink tracking-tight">Login</h1>
            <p className="text-sm text-gray-500 mt-1">Access your VyapaarSathi dashboard</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="w-full rounded-sm px-4 py-2.5 bg-white border border-gray-300 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="w-full rounded-sm px-4 py-2.5 bg-white border border-gray-300 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button className="w-full bg-ink hover:bg-gray-800 font-semibold rounded-sm px-4 py-2.5 text-white transition mt-2 shadow-sm">
            Sign In
          </button>
          
          <p className="text-sm text-center text-gray-600 mt-2">
            Don't have an account?{' '}
            <Link href="/signup" className="text-ink font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {searchParams?.message && (
            <p className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm text-center rounded-sm">
              {searchParams.message}
            </p>
          )}
          {searchParams?.error && (
            <p className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm text-center rounded-sm">
              {searchParams.error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
