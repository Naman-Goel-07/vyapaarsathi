'use client'

import React from 'react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { Languages } from 'lucide-react'

interface LanguageToggleProps {
  className?: string
  showIcon?: boolean
}

export default function LanguageToggle({
  className = '',
  showIcon = true
}: LanguageToggleProps) {
  const { lang, setLanguage } = useLanguage()

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-white border border-ink/40 rounded-sm p-0.5 shadow-xs font-mono text-xs select-none ${className}`}
      title="Switch Language / भाषा चुनें"
      role="group"
      aria-label="Language selector"
    >
      {showIcon && (
        <span className="pl-1.5 pr-0.5 text-gray-500 hidden sm:inline-flex items-center">
          <Languages size={13} className="text-ink" />
        </span>
      )}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 rounded-xs transition-colors font-medium text-[11px] uppercase tracking-wider ${
          lang === 'en'
            ? 'bg-ink text-white font-bold shadow-xs'
            : 'text-gray-600 hover:text-ink hover:bg-gray-100'
        }`}
        aria-pressed={lang === 'en'}
      >
        English
      </button>
      <span className="text-gray-300 font-mono text-[10px]">|</span>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2 py-0.5 rounded-xs transition-colors font-medium text-[11px] tracking-wide ${
          lang === 'hi'
            ? 'bg-ink text-white font-bold shadow-xs'
            : 'text-gray-600 hover:text-ink hover:bg-gray-100'
        }`}
        aria-pressed={lang === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  )
}
