'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { confirmTelegramPairing, disconnectTelegram, startTelegramPairing } from '@/app/dashboard/telegram/actions'

const copy = {
  en: {
    title: 'Telegram updates',
    intro: 'Connect a private chat to get updates about notices and next steps for your account. Send /work to see what needs your attention.',
    unavailable: 'Telegram linking is unavailable for this account right now.',
    connected: 'Your Telegram chat is connected.',
    paused: 'Your Telegram chat is connected. Updates are paused because this account no longer has access to the pilot.',
    connect: 'Connect Telegram',
    open: 'Open Telegram',
    instructions: 'Open the bot, tap Start, then enter the 8-digit code it sends you here. The link expires in 10 minutes.',
    code: 'Code from Telegram',
    confirm: 'Confirm connection',
    restart: 'Create a new link',
    disconnect: 'Disconnect Telegram',
    error: 'We couldn’t update your Telegram settings. Try again.',
    invalid: 'The code was incorrect or expired. Check the code or create a new link.',
    conflict: 'This Telegram chat or VyapaarSathi account is already connected. Disconnect it before linking again.',
  },
  hi: {
    title: 'टेलीग्राम अपडेट',
    intro: 'अपने खाते के नोटिस और अगले कदम की जानकारी निजी चैट में पाएं। बाकी काम देखने के लिए /work भेजें।',
    unavailable: 'इस खाते के लिए टेलीग्राम अभी उपलब्ध नहीं है।',
    connected: 'आपकी टेलीग्राम चैट जुड़ गई है।',
    paused: 'आपकी टेलीग्राम चैट जुड़ी है। इस खाते की पायलट अनुमति हट गई है, इसलिए अपडेट रुके हैं।',
    connect: 'टेलीग्राम जोड़ें',
    open: 'टेलीग्राम खोलें',
    instructions: 'बॉट खोलें, Start दबाएं और उससे मिला 8 अंकों का कोड यहां डालें। लिंक 10 मिनट में समाप्त हो जाएगा।',
    code: 'टेलीग्राम से मिला कोड',
    confirm: 'कनेक्शन की पुष्टि करें',
    restart: 'नया लिंक बनाएं',
    disconnect: 'टेलीग्राम हटाएं',
    error: 'टेलीग्राम की सेटिंग बदल नहीं पाई। फिर से कोशिश करें।',
    invalid: 'कोड गलत है या उसकी समय सीमा खत्म हो गई है। कोड जांचें या नया लिंक बनाएं।',
    conflict: 'यह चैट या व्यापारीसाथी खाता पहले से जुड़ा है। फिर से जोड़ने से पहले कनेक्शन हटाएं।',
  },
}

const primary = 'owner-primary inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white hover:bg-emerald-900 disabled:opacity-50'
const secondary = 'owner-secondary inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-50'

export default function TelegramSettings({ available, initiallyConnected }: { available: boolean; initiallyConnected: boolean }) {
  const { lang } = useLanguage()
  const text = copy[lang]
  const [connected, setConnected] = useState(initiallyConnected)
  const [link, setLink] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<'error' | 'invalid' | 'conflict' | null>(null)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch {
      setError('error')
    } finally {
      setBusy(false)
    }
  }

  const start = () => run(async () => {
    const url = await startTelegramPairing(lang)
    if (!url) return setError('error')
    setLink(url)
    setPin('')
  })

  return (
    <section className="mx-auto my-4 max-w-lg space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h1 className="flex items-center gap-3 text-xl font-semibold"><Send size={22} aria-hidden="true" />{text.title}</h1>
      <p className="text-slate-700">{text.intro}</p>
      {error && <p role="alert" className="text-red-800">{text[error]}</p>}
      {connected ? (
        <div className="space-y-3">
          <p role="status" className="font-semibold text-emerald-800">{available ? text.connected : text.paused}</p>
          <button type="button" className={secondary} disabled={busy} onClick={() => run(async () => {
            if (!await disconnectTelegram()) return setError('error')
            setConnected(false)
          })}>{text.disconnect}</button>
        </div>
      ) : !available ? <p className="text-slate-600">{text.unavailable}</p> : link ? (
        <div className="space-y-4">
          <p>{text.instructions}</p>
          <a className={primary} href={link} target="_blank" rel="noopener noreferrer">{text.open}</a>
          <form className="space-y-4" onSubmit={event => {
            event.preventDefault()
            void run(async () => {
              const result = await confirmTelegramPairing(pin)
              if (result !== 'linked') return setError(result)
              setConnected(true)
              setLink('')
              setPin('')
            })
          }}>
            <label className="owner-field block font-medium">
              {text.code}
              <input className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-base" value={pin} maxLength={8}
                inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" required
                onChange={event => setPin(event.target.value.replace(/\D/g, ''))} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button className={primary} type="submit" disabled={busy}>{text.confirm}</button>
              <button className={secondary} type="button" disabled={busy} onClick={start}>{text.restart}</button>
            </div>
          </form>
        </div>
      ) : <button className={primary} type="button" disabled={busy} onClick={start}>{text.connect}</button>}
    </section>
  )
}
