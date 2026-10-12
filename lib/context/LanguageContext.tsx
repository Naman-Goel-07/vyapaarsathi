'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Language, dictionaries, getTranslation } from '@/lib/locales'
import { en } from '@/lib/locales/en'

interface LanguageContextType {
  lang: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (path: string, fallback?: string) => string
  dict: typeof en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const COOKIE_NAME = 'vyapaar_lang'
const STORAGE_KEY = 'vyapaar_lang'

export function LanguageProvider({
  children,
  initialLang = 'en'
}: {
  children: React.ReactNode
  initialLang?: Language
}) {
  const [lang, setLangState] = useState<Language>(initialLang)

  // Read stored preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored === 'en' || stored === 'hi') {
        setLangState(stored)
        document.documentElement.lang = stored
        return
      }

      // Check cookie as backup
      const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'))
      if (match && (match[2] === 'en' || match[2] === 'hi')) {
        const cookieLang = match[2] as Language
        setLangState(cookieLang)
        document.documentElement.lang = cookieLang
      }
    } catch {
      // LocalStorage or cookie unavailable
    }
  }, [])

  const setLanguage = (newLang: Language) => {
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
      document.cookie = `${COOKIE_NAME}=${newLang}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = newLang
    } catch {
      // Ignore storage errors
    }
  }

  const toggleLanguage = () => {
    setLanguage(lang === 'en' ? 'hi' : 'en')
  }

  const dict = useMemo(() => dictionaries[lang] || dictionaries.en, [lang])

  const t = (path: string, fallback?: string): string => {
    return getTranslation(dict, path, fallback)
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        toggleLanguage,
        t,
        dict
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Graceful fallback if called outside provider
    return {
      lang: 'en' as Language,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (path: string, fallback?: string) => getTranslation(dictionaries.en, path, fallback),
      dict: dictionaries.en
    }
  }
  return context
}
