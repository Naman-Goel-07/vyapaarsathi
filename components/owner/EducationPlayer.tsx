'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/context/LanguageContext'
import type { EducationVideo } from '@/lib/owner-education'

type Player = { mute: () => void; playVideo: () => void; destroy: () => void }
type PlayerEvent = { target: Player }
type YouTubeApi = {
  Player: new (frame: HTMLIFrameElement, options: { events: {
    onReady: (event: PlayerEvent) => void
    onError: () => void
    onAutoplayBlocked: () => void
    onStateChange: (event: { data: number }) => void
  } }) => Player
}

let apiRequest: Promise<YouTubeApi> | undefined

function loadYouTubeApi() {
  const browser = window as Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void }
  if (browser.YT?.Player) return Promise.resolve(browser.YT)

  apiRequest ??= new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement('script')
    const previous = browser.onYouTubeIframeAPIReady
    const cleanup = () => {
      clearTimeout(timer)
      if (browser.onYouTubeIframeAPIReady === ready) browser.onYouTubeIframeAPIReady = previous
    }
    const fail = () => {
      cleanup()
      script.remove()
      reject(new Error('YouTube player API unavailable'))
    }
    const ready = () => {
      if (!browser.YT?.Player) { fail(); return }
      cleanup()
      resolve(browser.YT)
      previous?.()
    }
    const timer = window.setTimeout(fail, 10000)
    browser.onYouTubeIframeAPIReady = ready
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = fail
    document.head.appendChild(script)
  }).catch(error => {
    apiRequest = undefined
    throw error
  })
  return apiRequest
}

export default function EducationPlayer({ video, short = false }: { video: EducationVideo; short?: boolean }) {
  const { t } = useLanguage()
  const host = useRef<HTMLDivElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<'ready' | 'blocked' | 'error'>('ready')
  const { id, title, lang } = video

  useEffect(() => {
    const container = host.current
    if (!container) return
    const params = new URLSearchParams({
      autoplay: '1', playsinline: '1', enablejsapi: '1', rel: '0', hl: lang, origin: window.location.origin,
    })
    if (short) {
      params.set('mute', '1')
      params.set('loop', '1')
      params.set('playlist', id)
    }

    const frame = document.createElement('iframe')
    frame.title = title
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
    frame.allowFullscreen = true
    frame.referrerPolicy = 'strict-origin-when-cross-origin'
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?${params}`
    container.appendChild(frame)

    let active = true
    let player: Player | undefined
    loadYouTubeApi().then(api => {
      if (!active) return
      player = new api.Player(frame, {
        events: {
          onReady: ({ target }) => {
            if (active && short) { target.mute(); target.playVideo() }
          },
          onError: () => { if (active) setStatus('error') },
          onAutoplayBlocked: () => { if (active) setStatus('blocked') },
          onStateChange: ({ data }) => { if (active && data === 1) setStatus('ready') },
        },
      })
    }).catch(() => {
      // The embedded player can still be used when its optional JS API is blocked.
    })
    return () => {
      active = false
      try { player?.destroy() } finally { frame.remove() }
    }
  }, [attempt, id, lang, short, title])

  return (
    <div className={short ? 'education-short-player' : 'education-video-player'}>
      <div className="education-frame" ref={host} />
      {status === 'blocked' && <p className="owner-sub mt-2" role="status">{t('owner.educationTapPlay')}</p>}
      {status === 'error' && (
        <div className="education-player-error">
          <p role="status">{t('owner.educationUnavailable')}</p>
          <button type="button" className="owner-secondary" onClick={() => { setStatus('ready'); setAttempt(n => n + 1) }}>
            {t('owner.retry')}
          </button>
        </div>
      )}
    </div>
  )
}
