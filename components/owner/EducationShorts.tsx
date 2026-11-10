'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronsUp, Maximize, Minimize, X } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { educationShorts, type EducationVideo } from '@/lib/owner-education'
import EducationPlayer from './EducationPlayer'

type Filter = 'all' | EducationVideo['lang']

function shuffleShorts(filter: Filter, lastId?: string) {
  const clips = educationShorts.filter(clip => filter === 'all' || clip.lang === filter)
  for (let index = clips.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[clips[index], clips[other]] = [clips[other], clips[index]]
  }
  if (clips.length > 1 && clips[0].id === lastId) clips.push(clips.shift()!)
  return clips
}

export default function EducationShorts({ filter, onFilterChange, previousId, onClipChange, onClose }: {
  filter: Filter
  onFilterChange: (language: Filter) => void
  previousId?: string
  onClipChange: (id: string) => void
  onClose: () => void
}) {
  const { t } = useLanguage()
  const dialog = useRef<HTMLDialogElement>(null)
  const feed = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null)
  const lastWheel = useRef(-Infinity)
  const [clips, setClips] = useState(() => shuffleShorts(filter, previousId))
  const [position, setPosition] = useState(0)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const clip = clips[position]

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    const onFullscreen = () => setFullscreen(document.fullscreenElement === feed.current)
    setCanFullscreen(document.fullscreenEnabled === true)
    document.addEventListener('fullscreenchange', onFullscreen)
    element?.showModal()
    closeButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.body.style.overflow = previousOverflow
      element?.close()
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => { onClipChange(clip.id) }, [clip.id, onClipChange])

  const restart = (language: Filter) => {
    setClips(shuffleShorts(language, clip.id))
    setPosition(0)
  }
  const move = (delta: -1 | 1) => {
    const next = position + delta
    if (next < 0) return
    if (next === clips.length) restart(filter)
    else setPosition(next)
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === feed.current) await document.exitFullscreen()
      else await feed.current?.requestFullscreen()
    } catch {
      // The feed already fills the page on browsers that decline native fullscreen.
    }
  }

  return (
    <dialog ref={dialog} className="education-shorts-dialog" aria-labelledby="education-shorts-title"
      onCancel={event => { event.preventDefault(); onClose() }}
      onKeyDown={event => {
        if (event.target instanceof HTMLSelectElement || event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowDown' || event.key === 'PageDown') { event.preventDefault(); move(1) }
        else if (event.key === 'ArrowUp' || event.key === 'PageUp') { event.preventDefault(); move(-1) }
      }}>
      <div ref={feed} className="education-shorts-feed"
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('button, select, a')) return
          swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerCancel={() => { swipe.current = null }}
        onPointerUp={event => {
          const start = swipe.current
          if (!start || start.id !== event.pointerId) return
          swipe.current = null
          const dy = start.y - event.clientY
          const dx = start.x - event.clientX
          if (Math.abs(dy) >= 44 && Math.abs(dy) > Math.abs(dx)) move(dy > 0 ? 1 : -1)
        }}
        onWheel={event => {
          if (event.ctrlKey || (event.target as Element).closest('select') || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
          if (Math.abs(event.deltaY) < (event.deltaMode ? 1 : 16) || event.timeStamp - lastWheel.current < 450) return
          lastWheel.current = event.timeStamp
          move(event.deltaY > 0 ? 1 : -1)
        }}>
        <header className="education-shorts-header">
          <button ref={closeButton} type="button" className="education-shorts-button" onClick={onClose} aria-label={t('owner.educationCloseShorts')}>
            <X size={22} aria-hidden="true" />
          </button>
          <h2 id="education-shorts-title">{t('owner.educationShorts')}</h2>
          <select aria-label={t('owner.educationLanguage')} value={filter} onChange={event => {
            const value = event.target.value as Filter
            onFilterChange(value)
            restart(value)
          }}>
            <option value="all">{t('owner.educationAllLanguages')}</option>
            <option value="en">{t('owner.english')}</option>
            <option value="hi">{t('owner.hindi')}</option>
          </select>
          {canFullscreen && (
            <button type="button" className="education-shorts-button" onClick={toggleFullscreen}
              aria-label={t(fullscreen ? 'owner.educationExitFullscreen' : 'owner.educationFullscreen')}>
              {fullscreen ? <Minimize size={19} aria-hidden="true" /> : <Maximize size={19} aria-hidden="true" />}
            </button>
          )}
        </header>

        <div className="education-shorts-stage">
          <EducationPlayer key={clip.id} video={clip} short />
        </div>

        <footer className="education-shorts-footer">
          <div className="education-shorts-caption" aria-live="polite" aria-atomic="true">
            <p>{t(`owner.educationTopic_${clip.topic}`)} · {t(clip.lang === 'en' ? 'owner.english' : 'owner.hindi')} · {t('owner.educationPosition').replace('{current}', String(position + 1)).replace('{total}', String(clips.length))}</p>
            <h3 lang={clip.lang}>{clip.title}</h3>
          </div>
          <div className="education-shorts-swipe" role="group" aria-label={t('owner.educationShortControls')}>
            <span><ChevronsUp size={17} aria-hidden="true" />{t('owner.educationSwipeShorts')}</span>
            <button type="button" className="education-shorts-button" aria-label={t('owner.educationPreviousShort')} disabled={position === 0} onClick={() => move(-1)}><ArrowUp size={19} aria-hidden="true" /></button>
            <button type="button" className="education-shorts-button" aria-label={t('owner.educationNextShort')} onClick={() => move(1)}><ArrowDown size={19} aria-hidden="true" /></button>
          </div>
        </footer>
      </div>
    </dialog>
  )
}
