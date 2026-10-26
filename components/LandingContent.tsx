'use client'
import Link from 'next/link'
import { Play, Check } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import SiteFrame from '@/components/SiteFrame'
import DemoButtons from '@/components/DemoButtons'

const WAVE = [8, 14, 10, 20, 12, 24, 9, 16, 22, 11, 18, 7, 15, 21, 10, 13]
const STEPS = ['how1', 'how2', 'how3', 'how4']

export default function LandingContent({ demoEnabled = false }: { demoEnabled?: boolean }) {
  const { t } = useLanguage()
  return (
    <SiteFrame wide>
      <section className="site-hero">
        <div className="space-y-5">
          <h1 className="site-title">{t('site.heroTitle')}</h1>
          <p className="text-lg" style={{ color: 'var(--muted)' }}>{t('site.heroText')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/signup" className="owner-primary">{t('site.start')}</Link>
            <Link href="/login" className="owner-secondary">{t('site.login')}</Link>
          </div>
          {demoEnabled && <DemoButtons />}
        </div>

        <div className="site-phone space-y-3" aria-hidden="true">
          <div className="owner-urgent tone-soon">
            <p className="text-sm font-semibold">{t('owner.mostUrgent')}</p>
            <p className="text-lg font-semibold mt-1">{t('owner.epfo')} · {t('owner.daysLeft').replace('{count}', '6')}</p>
            <p className="text-sm mt-1">{t('owner.yourTurn')}</p>
          </div>
          <div className="owner-voice">
            <span className="owner-voice-play"><Play size={20} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{t('owner.listenSimple')}</p>
              <div className="owner-wave">{WAVE.map((h, i) => <i key={i} style={{ height: h }} />)}</div>
            </div>
          </div>
          <div className="owner-list">
            <div className="owner-notice">
              <span className="owner-badge badge-gst">GST</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{t('owner.gst')}</p>
                <p className="owner-sub truncate">{t('owner.caChecking')}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="owner-amount">₹2,37,337</span>
                <span className="owner-status tone-fine">{t('owner.daysLeft').replace('{count}', '20')}</span>
              </div>
            </div>
            <div className="owner-notice">
              <span className="owner-badge badge-incomeTax">IT</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{t('owner.incomeTax')}</p>
                <p className="owner-sub truncate">{t('owner.filedHint')}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="owner-amount owner-sub">₹13,18,500</span>
                <span className="owner-sub flex items-center gap-1" style={{ color: 'var(--green)' }}><Check size={14} />{t('owner.filed')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="owner-section-title">{t('site.howTitle')}</h2>
          <ol className="space-y-3">
            {STEPS.map((key, i) => (
              <li key={key} className="flex items-center gap-3">
                <span className="owner-avatar" style={{ width: 32, height: 32, fontSize: 14 }}>{i + 1}</span>
                <span>{t(`site.${key}`)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <div className="owner-card space-y-1">
            <p>{t('site.caLine')}</p>
            <Link href="/signup?role=ca" className="owner-text-link">{t('site.caLink')}</Link>
          </div>
          <p className="owner-sub">{t('site.trust')}</p>
        </div>
      </section>
    </SiteFrame>
  )
}
