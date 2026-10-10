'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { error?: string; message?: string }
}) {
  const [role, setRole] = useState('owner')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        <form 
          className="flex flex-col w-full gap-4" 
          action={signup}
          onSubmit={() => setIsSubmitting(true)}
        >
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold font-serif text-ink tracking-tight">Sign Up</h1>
            <p className="text-sm text-gray-500 mt-1">Get started with compliance tracking</p>
          </div>
          
          {searchParams?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
              <p className="font-semibold">Sign Up Failed</p>
              <p className="mt-0.5">{searchParams.error}</p>
            </div>
          )}

          {searchParams?.message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm">
              {searchParams.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="role">
              I am a:
            </label>
            <select 
              id="role"
              name="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-sm px-4 py-2.5 bg-white border border-gray-300 text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition"
            >
              <option value="owner">Business Owner</option>
              <option value="ca">Chartered Accountant</option>
            </select>
          </div>

          {role === 'owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="businessName">
                Business Name
              </label>
              <input 
                id="businessName"
                className="w-full rounded-sm px-4 py-2.5 bg-white border border-gray-300 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition" 
                name="businessName" 
                placeholder="My Business Pvt Ltd" 
                required 
              />
            </div>
          )}

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
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ink hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed font-semibold rounded-sm px-4 py-2.5 text-white transition mt-2 shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-sm text-center text-gray-600 mt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-ink font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
