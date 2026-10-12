'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'

interface LoginFormProps {
  loginAction: (formData: FormData) => void
  searchParams?: { message?: string; error?: string }
}

export default function LoginForm({ loginAction, searchParams }: LoginFormProps) {
  const { t } = useLanguage()

  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:max-w-md justify-center gap-2 mx-auto min-h-screen py-12 bg-paper text-ink">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-ink font-medium"
        >
          <ArrowLeft size={16} />
          <span>{t('common.backToHome', 'Back to Home')}</span>
        </Link>
        <LanguageToggle />
      </div>

      <div className="bg-white p-8 rounded-sm shadow-sm border-2 border-ink">
        <form className="flex flex-col w-full gap-4" action={loginAction}>
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold font-serif text-ink tracking-tight">
              {t('auth.loginTitle', 'Login')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('auth.loginSubtitle', 'Access your VyapaarSathi dashboard')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
              {t('auth.emailLabel', 'Email')}
            </label>
            <input
              id="email"
              className="w-full rounded-sm px-4 py-2.5 bg-white border border-gray-300 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition"
              name="email"
              type="email"
              placeholder={t('auth.emailPlaceholder', 'you@example.com')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">
              {t('auth.passwordLabel', 'Password')}
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
            className="w-full bg-ink hover:bg-gray-800 font-semibold rounded-sm px-4 py-2.5 text-white transition mt-2 shadow-sm cursor-pointer"
          >
            {t('auth.signInBtn', 'Sign In')}
          </button>

          <p className="text-sm text-center text-gray-600 mt-2">
            {t('auth.noAccount', "Don't have an account?")}{' '}
            <Link href="/signup" className="text-ink font-semibold hover:underline">
              {t('auth.signupLink', 'Sign up')}
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
