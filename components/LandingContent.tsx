'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'

export default function LandingContent() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-paper text-ink relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageToggle />
      </div>

      <div className="max-w-md w-full bg-white rounded-sm shadow-sm border-2 border-ink p-8 text-center space-y-6">
        <div className="flex justify-center">
          <span className="text-[10px] font-mono tracking-widest uppercase bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-xs border border-gray-200">
            {t('landing.msmeTag', 'Empowering Indian MSMEs & Tax Professionals')}
          </span>
        </div>

        <h1 className="text-3xl font-bold font-serif text-ink tracking-tight">
          {t('landing.heroTitle', 'VyapaarSathi')}
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed">
          {t('landing.heroSubtitle', 'The Government Action Tracker for MSMEs and Chartered Accountants. Never miss a compliance deadline again.')}
        </p>

        <div className="space-y-3 pt-2">
          <Link
            href="/login"
            className="block w-full bg-ink text-white font-semibold py-3 rounded-sm hover:bg-gray-800 transition shadow-sm text-sm"
          >
            {t('landing.loginBtn', 'Login to Dashboard')}
          </Link>
          <Link
            href="/signup"
            className="block w-full bg-white text-ink font-semibold py-3 rounded-sm hover:bg-gray-50 transition border border-gray-300 shadow-sm text-sm"
          >
            {t('landing.signupBtn', 'Create an Account')}
          </Link>
        </div>
      </div>
    </div>
  )
}
