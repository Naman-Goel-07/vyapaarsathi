'use client'

import { useCallback, useRef, useState } from 'react'
import { BookOpen, ExternalLink, GraduationCap, Info, Play, Smartphone } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { educationBlogs, educationVideos, type EducationVideo } from '@/lib/owner-education'
import EducationPlayer from './EducationPlayer'
import EducationShorts from './EducationShorts'
import OwnerModal from './OwnerModal'

type Format = 'blogs' | 'videos'
type Filter = 'all' | 'en' | 'hi'
const formats = [
  { id: 'blogs', label: 'educationBlogs', icon: BookOpen },
  { id: 'videos', label: 'educationVideos', icon: Play },
] as const

const taxYearGuide = 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns'

function matches(resource: { lang: string }, filter: Filter) {
  return filter === 'all' || resource.lang === filter
}

export default function OwnerEducation() {
  const { t } = useLanguage()
  const [format, setFormat] = useState<Format>('blogs')
  const [filter, setFilter] = useState<Filter>('all')
  const [video, setVideo] = useState<EducationVideo | null>(null)
  const [shortsOpen, setShortsOpen] = useState(false)
  const lastShort = useRef<string>()
  const rememberShort = useCallback((id: string) => { lastShort.current = id }, [])

  const languageLabel = (language: 'en' | 'hi') => t(language === 'en' ? 'owner.english' : 'owner.hindi')
  const topicLabel = (topic: EducationVideo['topic']) => t(`owner.educationTopic_${topic}`)
  const openMore = t('owner.educationReadMore')
  const watch = t('owner.educationWatch')

  return (
    <section className="owner-education" aria-labelledby="education-title">
      <header className="education-hero">
        <div className="education-hero-icon" aria-hidden="true"><GraduationCap size={28} /></div>
        <div>
          <h1 id="education-title">{t('owner.education')}</h1>
          <p>{t('owner.educationIntro')}</p>
        </div>
      </header>

      <div className="education-toolbar">
        <div className="education-formats" role="group" aria-label={t('owner.educationFormat')}>
          {formats.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={format === id} onClick={() => setFormat(id)}>
              <Icon size={17} aria-hidden="true" />
              {t(`owner.${label}`)}
            </button>
          ))}
          <button type="button" aria-haspopup="dialog" onClick={() => setShortsOpen(true)}>
            <Smartphone size={17} aria-hidden="true" />
            {t('owner.educationShorts')}
          </button>
        </div>
        <label className="education-filter">
          <span>{t('owner.educationLanguage')}</span>
          <select value={filter} onChange={event => setFilter(event.target.value as Filter)}>
            <option value="all">{t('owner.educationAllLanguages')}</option>
            <option value="en">{languageLabel('en')}</option>
            <option value="hi">{languageLabel('hi')}</option>
          </select>
        </label>
      </div>

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

      {shortsOpen && <EducationShorts filter={filter} onFilterChange={setFilter} previousId={lastShort.current} onClipChange={rememberShort} onClose={() => setShortsOpen(false)} />}

      {video && <OwnerModal title={video.title} onClose={() => setVideo(null)}>
        <EducationPlayer key={video.id} video={video} />
        <p className="owner-sub" lang={video.lang}>{video.summary}</p>
      </OwnerModal>}
    </section>
  )
}
