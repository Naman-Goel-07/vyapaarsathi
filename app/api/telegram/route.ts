import { randomInt } from 'node:crypto'
import { workMessage, type BotLanguage, type WorkItem } from '@/lib/telegram/messages'
import { databaseFailure, hashToken, matchesSecret, sendTelegram, telegramConfig, telegramDatabase } from '@/lib/telegram/server'

type TelegramUpdate = {
  message?: {
    chat?: { id?: number; type?: string }
    from?: { id?: number; is_bot?: boolean }
    text?: string
  }
}

export async function POST(request: Request) {
  const config = telegramConfig()
  if (!config) return new Response(null, { status: 503 })
  if (!matchesSecret(request.headers.get('x-telegram-bot-api-secret-token'), config.webhookSecret)) {
    return new Response(null, { status: 401 })
  }
  const update: TelegramUpdate | null = await request.json().catch(() => null)
  if (!update) return new Response(null, { status: 400 })
  const message = update.message
  const id = message?.chat?.id
  if (message?.chat?.type !== 'private' || typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0
    || message.from?.id !== id || message.from?.is_bot || typeof message.text !== 'string') {
    return new Response(null, { status: 204 })
  }
  const [command, argument] = message.text.trim().split(/\s+/, 2)
  if (!['/start', '/work', '/stop', '/help'].includes(command)) return new Response(null, { status: 204 })

  const chatId = String(id)
  const db = telegramDatabase(config)
  const settingsLink = { text: 'Telegram settings', url: `${config.origin}/dashboard/telegram` }
  const reply = async (text: string, links?: typeof settingsLink[]) => {
    const result = await sendTelegram(config, chatId, { text, links })
    return new Response(null, { status: result.delivered || result.permanent ? 204 : 502 })
  }

  try {
    if (command === '/start' && argument) {
      if (!/^[A-Za-z0-9_-]{43}$/.test(argument)) return reply('This link is invalid. Open Telegram settings to create a new one.', [settingsLink])
      const { data, error } = await db.rpc('telegram_open_pairing', {
        p_hash: hashToken(argument), p_chat: chatId, p_pin: String(randomInt(10_000_000, 100_000_000)),
      }).maybeSingle<{ pin: string; lang: BotLanguage }>()
      if (error) throw databaseFailure('open pairing', error)
      if (!data) return reply('This link has expired or has already been used. Open Telegram settings to create a new one.', [settingsLink])
      return reply(data.lang === 'hi'
        ? `अपना टेलीग्राम जोड़ने के लिए व्यापारीसाथी में यह कोड दर्ज करें।\n\n${data.pin}`
        : `Enter this code on your signed-in VyapaarSathi page to connect this Telegram chat.\n\n${data.pin}`)
    }

    const { data: account, error } = await db.from('telegram_accounts')
      .select('id, user_id, lang').eq('chat_id', chatId).maybeSingle()
    if (error) throw databaseFailure('look up chat', error)
    if (!account) return reply('Open Telegram settings in your VyapaarSathi account to connect this chat.', [settingsLink])
    const lang: BotLanguage = account.lang
    if (command === '/stop') {
      const { error: removeError } = await db.from('telegram_accounts').delete().eq('id', account.id)
      if (removeError) throw databaseFailure('unlink chat', removeError)
      return reply(lang === 'hi' ? 'टेलीग्राम अपडेट बंद कर दिए गए हैं।' : 'Your Telegram updates are turned off.', [settingsLink])
    }
    if (command === '/work') {
      const { data: profile, error: profileError } = await db.from('profiles').select('role').eq('id', account.user_id).maybeSingle()
      if (profileError) throw databaseFailure('look up role', profileError)
      if (!profile || (profile.role !== 'owner' && profile.role !== 'ca')) return reply('Reconnect your account in VyapaarSathi.', [settingsLink])
      const { data, error: workError } = await db.rpc('telegram_work', { p_account: account.id }).returns<WorkItem[]>()
      if (workError || !Array.isArray(data)) throw databaseFailure('read work queue', workError || {})
      const work = workMessage(data, lang, config.origin, profile.role)
      return reply(work.text, work.links)
    }
    return reply(lang === 'hi'
      ? 'यह चैट आपके व्यापारीसाथी खाते से जुड़ी है।\n/work — अपना बाकी काम देखें\n/stop — अपडेट बंद करें'
      : 'This chat is connected to your VyapaarSathi account.\n/work — View notices that need your attention\n/stop — Turn off Telegram updates')
  } catch {
    return new Response(null, { status: 503 })
  }
}
