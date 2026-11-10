'use client'

import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, BookOpen, ExternalLink, GraduationCap, Info, Play, Smartphone } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { educationBlogs, educationShorts, educationVideos, type EducationVideo } from '@/lib/owner-education'
import EducationPlayer from './EducationPlayer'
import OwnerModal from './OwnerModal'

type Format = 'blogs' | 'videos' | 'shorts'
type Filter = 'all' | 'en' | 'hi'
const formats = [
  { id: 'blogs', label: 'educationBlogs', icon: BookOpen },
  { id: 'videos', label: 'educationVideos', icon: Play },
  { id: 'shorts', label: 'educationShorts', icon: Smartphone },
] as const

const taxYearGuide = 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns'

function matches(resource: { lang: string }, filter: Filter) {
  return filter === 'all' || resource.lang === filter
}

function shuffleShorts(filter: Filter, lastId?: string) {
  const shorts = educationShorts.filter(item => matches(item, filter))
  for (let index = shorts.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shorts[index], shorts[other]] = [shorts[other], shorts[index]]
  }
  if (shorts.length > 1 && shorts[0].id === lastId) shorts.push(shorts.shift()!)
  return shorts
}

export default function OwnerEducation() {
  const { t } = useLanguage()
  const [format, setFormat] = useState<Format>('blogs')
  const [filter, setFilter] = useState<Filter>('all')
  const [video, setVideo] = useState<EducationVideo | null>(null)
  const [shorts, setShorts] = useState<EducationVideo[]>([])
  const [position, setPosition] = useState(0)
  const [shortRun, setShortRun] = useState(0)
  const lastShort = useRef<string>()
  const touchStart = useRef<number | null>(null)
  const short = shorts[position]

  const startShorts = (language: Filter) => {
    const shuffled = shuffleShorts(language, lastShort.current)
    lastShort.current = shuffled[0]?.id
    setShorts(shuffled)
    setPosition(0)
    setShortRun(run => run + 1)
  }

  const moveShort = (delta: number) => {
    if (position + delta < 0) return
    if (position + delta >= shorts.length) { startShorts(filter); return }
    lastShort.current = shorts[position + delta].id
    setPosition(position + delta)
  }

  const languageLabel = (language: 'en' | 'hi') => t(language === 'en' ? 'owner.english' : 'owner.hindi')
  const topicLabel = (topic: EducationVideo['topic']) => t(`owner.educationTopic_${topic}`)
  const openMore = t('owner.educationReadMore')
  const watch = t('owner.educationWatch')

  return (
    <section className="owner-education" aria-labelledby="education-title">
      <header className={`education-hero${format === 'shorts' ? ' education-hero-compact' : ''}`}>
        <div className="education-hero-icon" aria-hidden="true"><GraduationCap size={28} /></div>
        <div>
          <h1 id="education-title">{t('owner.education')}</h1>
          {format !== 'shorts' && <p>{t('owner.educationIntro')}</p>}
        </div>
      </header>

      <div className="education-toolbar">
        <div className="education-formats" role="group" aria-label={t('owner.educationFormat')}>
          {formats.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={format === id} onClick={() => {
              if (id === 'shorts') startShorts(filter)
              setFormat(id)
            }}>
              <Icon size={17} aria-hidden="true" />
              {t(`owner.${label}`)}
            </button>
          ))}
        </div>
        <label className="education-filter">
          <span>{t('owner.educationLanguage')}</span>
          <select value={filter} onChange={event => {
            const value = event.target.value as Filter
            setFilter(value)
            if (format === 'shorts') startShorts(value)
          }}>
            <option value="all">{t('owner.educationAllLanguages')}</option>
            <option value="en">{languageLabel('en')}</option>
            <option value="hi">{languageLabel('hi')}</option>
          </select>
        </label>
      </div>

      {format === 'shorts' && short && (
        <div className="education-shorts">
          <div className="education-reel">
            <EducationPlayer key={`${shortRun}-${short.id}`} video={short} short />
            <div className="education-reel-nav" role="group" aria-label={t('owner.educationShortControls')}
              onTouchStart={event => { touchStart.current = event.touches[0].clientY }}
              onTouchCancel={() => { touchStart.current = null }}
              onTouchEnd={event => {
                const start = touchStart.current
                touchStart.current = null
                if (start === null) return
                const distance = start - event.changedTouches[0].clientY
                if (Math.abs(distance) >= 45) moveShort(distance > 0 ? 1 : -1)
              }}>
              <button type="button" className="owner-icon" aria-label={t('owner.educationPreviousShort')} disabled={position === 0} onClick={() => moveShort(-1)}><ArrowUp size={21} aria-hidden="true" /></button>
              <button type="button" className="owner-icon" aria-label={t('owner.educationNextShort')} onClick={() => moveShort(1)}><ArrowDown size={21} aria-hidden="true" /></button>
            </div>
          </div>
          <div className="education-short-caption" aria-live="polite">
            <p className="education-card-meta">
              <span>{topicLabel(short.topic)}</span>
              <span>{languageLabel(short.lang)}</span>
              <span>{t('owner.educationPosition').replace('{current}', String(position + 1)).replace('{total}', String(shorts.length))}</span>
            </p>
            <div lang={short.lang}><h2>{short.title}</h2><p>{short.summary}</p></div>
          </div>
        </div>
      )}

      {format !== 'shorts' && (
        <>
          <aside className="education-tax-note">
            <Info size={18} aria-hidden="true" />
            <p><strong>{t('owner.educationTaxYearTitle')}</strong> {t('owner.educationTaxYearNote')}{' '}
              <a href={taxYearGuide} target="_blank" rel="noopener noreferrer">{t('owner.educationTaxYearGuide')}</a>
            </p>
          </aside>
          <div className="education-grid">
            {format === 'blogs' ? educationBlogs.filter(blog => matches(blog, filter)).map(blog => (
              <article className="education-card" key={blog.url}>
                <div className="education-card-meta"><span>{topicLabel(blog.topic)}</span><span>{languageLabel(blog.lang)}</span></div>
                <div lang={blog.lang}>
                  <p className="education-publisher">{blog.publisher}</p>
                  <h2>{blog.title}</h2>
                  <p className="education-summary education-blog-summary">{blog.summary}</p>
                </div>
                <a className="education-action" href={blog.url} target="_blank" rel="noopener noreferrer" aria-label={`${openMore}: ${blog.title}`}>
                  {openMore}<ExternalLink size={15} aria-hidden="true" />
                </a>
              </article>
            )) : educationVideos.filter(item => matches(item, filter)).map(item => (
              <article className="education-card" key={item.id}>
                <div className="education-card-meta"><span>{topicLabel(item.topic)}</span><span>{languageLabel(item.lang)}</span></div>
                <div lang={item.lang}>
                  <h2>{item.title}</h2>
                  <p className="education-summary">{item.summary}</p>
                </div>
                <button type="button" className="education-action" onClick={() => setVideo(item)} aria-label={`${watch}: ${item.title}`}>
                  <Play size={15} aria-hidden="true" />{watch}
                </button>
              </article>
            ))}
          </div>
        </>
      )}

      {video && <OwnerModal title={video.title} onClose={() => setVideo(null)}>
        <EducationPlayer key={video.id} video={video} />
        <p className="owner-sub" lang={video.lang}>{video.summary}</p>
      </OwnerModal>}
    </section>
  )
}
