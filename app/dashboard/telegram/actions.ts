'use server'

import { randomBytes } from 'node:crypto'
import { getProfile, getSessionUser } from '@/lib/supabase/session'
import { databaseFailure, hashToken, telegramConfig, telegramDatabase } from '@/lib/telegram/server'

async function settingsContext() {
  const config = telegramConfig()
  if (!config) return null
  const [user, profile] = await Promise.all([getSessionUser(), getProfile()])
  if (!user || !profile || !['owner', 'ca'].includes(profile.role)) return null
  const demoEmails = [process.env.DEMO_OWNER_EMAIL, process.env.DEMO_CA_EMAIL]
    .filter(Boolean).map(email => email!.trim().toLowerCase())
  if (user.email && demoEmails.includes(user.email.toLowerCase())) return null
  return { config, userId: user.id, db: telegramDatabase(config) }
}

export async function readTelegramSettings() {
  const context = await settingsContext()
  if (!context) return { available: false, connected: false }
  const [account, eligibility] = await Promise.all([
    context.db.from('telegram_accounts').select('id').eq('user_id', context.userId).maybeSingle(),
    context.db.rpc('telegram_can_link', { p_user: context.userId }),
  ])
  if (account.error || eligibility.error) {
    databaseFailure('read settings', account.error || eligibility.error || {})
    return { available: false, connected: false }
  }
  return { available: eligibility.data === true, connected: Boolean(account.data) }
}

export async function startTelegramPairing(lang: string) {
  const context = await settingsContext()
  if (!context || (lang !== 'en' && lang !== 'hi')) return null
  const { data: eligible, error: eligibilityError } = await context.db.rpc('telegram_can_link', { p_user: context.userId })
  if (eligibilityError) throw databaseFailure('check enrollment', eligibilityError)
  if (eligible !== true) return null
  const token = randomBytes(32).toString('base64url')
  const { error } = await context.db.from('telegram_pairings').upsert({
    user_id: context.userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    chat_id: null,
    pin: null,
    attempts: 0,
    lang,
  }, { onConflict: 'user_id' })
  if (error) {
    databaseFailure('create pairing', error)
    return null
  }
  return `https://t.me/${context.config.username}?start=${token}`
}

export async function confirmTelegramPairing(pin: string) {
  const context = await settingsContext()
  if (!context) return 'error'
  if (typeof pin !== 'string' || !/^\d{8}$/.test(pin)) return 'invalid'
  const { data, error } = await context.db.rpc('telegram_confirm_pairing', { p_user: context.userId, p_pin: pin })
  if (error) {
    databaseFailure('confirm pairing', error)
    return 'error'
  }
  return data === 'linked' || data === 'conflict' ? data : 'invalid'
}

export async function disconnectTelegram() {
  const context = await settingsContext()
  if (!context) return false
  const { error } = await context.db.rpc('telegram_disconnect', { p_user: context.userId })
  if (error) {
    databaseFailure('disconnect', error)
    return false
  }
  return true
}
