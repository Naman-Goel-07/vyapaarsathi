import { createHash, timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export function telegramConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const username = process.env.TELEGRAM_BOT_USERNAME
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  const dispatchSecret = process.env.TELEGRAM_DISPATCH_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const appUrl = process.env.TELEGRAM_APP_URL
  if (!token || !username || !webhookSecret || !dispatchSecret || !supabaseUrl || !serviceKey || !appUrl) return null
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(token) || !/^[A-Za-z0-9_]{5,32}$/.test(username)) return null
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(webhookSecret) || dispatchSecret.length < 32) return null

  try {
    const url = new URL(appUrl)
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null
    return { token, username, webhookSecret, dispatchSecret, supabaseUrl, serviceKey, origin: url.origin }
  } catch {
    return null
  }
}

type Config = NonNullable<ReturnType<typeof telegramConfig>>

export function telegramDatabase(config: Config) {
  return createClient(config.supabaseUrl, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(4500) }) },
  })
}

export function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function matchesSecret(value: string | null, expected: string) {
  return value !== null && timingSafeEqual(Buffer.from(hashToken(value)), Buffer.from(hashToken(expected)))
}

export function databaseFailure(operation: string, error: { code?: string }) {
  console.error('[telegram]', operation, error.code || 'database_error')
  return new Error('Telegram database operation failed')
}

export type TelegramMessage = { text: string; links?: { text: string; url: string }[] }

export async function sendTelegram(config: Config, chatId: string, message: TelegramMessage) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.text,
        protect_content: true,
        link_preview_options: { is_disabled: true },
        reply_markup: message.links?.length
          ? { inline_keyboard: message.links.map(link => [link]) }
          : undefined,
      }),
      signal: AbortSignal.timeout(4500),
    })
    const result = await response.json().catch(() => null)
    if (response.ok && result?.ok === true) return { delivered: true as const }
    const code = result?.error_code ?? response.status
    const retryAfter = result?.parameters?.retry_after
    return {
      delivered: false as const,
      permanent: code === 400 || code === 403,
      retryAfter: Number.isSafeInteger(retryAfter) && retryAfter > 0 ? retryAfter : 0,
    }
  } catch {
    return { delivered: false as const, permanent: false, retryAfter: 0 }
  }
}
