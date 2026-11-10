'use client'

import React from 'react'
import { Building2, Check } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'
import { formatDemandDisplay as money } from '@/lib/demand'

export interface ClientBusinessSummary {
  id: string
  name: string
  activeNoticesCount: number
  totalRisk: number
  hasCritical: boolean
  highestAuthority?: string
}

interface CAClientPortfolioProps {
  businesses: ClientBusinessSummary[]
  selectedBusinessId: string | null
  onSelectBusiness: (id: string | null) => void
}

export default function CAClientPortfolio({
  businesses = [],
  selectedBusinessId,
  onSelectBusiness
}: CAClientPortfolioProps) {
  const { t } = useLanguage()
  const totalClients = businesses.length
  const totalAggregateRisk = businesses.reduce((acc, b) => acc + (b.totalRisk || 0), 0)
  const totalActiveDockets = businesses.reduce((acc, b) => acc + (b.activeNoticesCount || 0), 0)
  const selectedBusiness = businesses.find(biz => biz.id === selectedBusinessId)

  return (
    <aside className="ca-panel ca-clients" aria-labelledby="ca-clients-title">
      <div className="ca-panel-heading">
        <h2 id="ca-clients-title">{t('ca.clients')} <span className="ca-count">{totalClients}</span></h2>
      </div>
      {businesses.length === 0 ? (
        <div className="ca-client-empty">
          <Building2 size={22} aria-hidden="true" />
          <p><strong>{t('ca.noClients')}</strong></p>
          <p className="ca-muted">{t('ca.noClientsHint')}</p>
        </div>
      ) : (
        <>
          <label className="ca-client-select">
            <span className="sr-only">{t('ca.clientScope')}</span>
            <select value={selectedBusinessId ?? ''} onChange={event => onSelectBusiness(event.target.value || null)}>
              <option value="">{t('ca.allClients')}</option>
              {businesses.map(biz => <option key={biz.id} value={biz.id}>{biz.name}</option>)}
            </select>
          </label>
          <div className="ca-client-buttons" role="group" aria-label={t('ca.clientScope')}>
            <button type="button" onClick={() => onSelectBusiness(null)} aria-pressed={selectedBusinessId === null}>
              <span>{t('ca.allClients')}</span>
              {selectedBusinessId === null && <Check size={17} aria-hidden="true" />}
            </button>
            {businesses.map(biz => {
              const isSelected = selectedBusinessId === biz.id
              return (
                <button type="button" key={biz.id} onClick={() => onSelectBusiness(isSelected ? null : biz.id)} aria-pressed={isSelected}>
                  <span>
                    <strong>{biz.name}</strong>
                    <small>{t('common.ref')} {biz.id.slice(0, 8).toUpperCase()}</small>
                    <small>{t('ca.active')}: {biz.activeNoticesCount} · {money(biz.totalRisk || 0)}</small>
                  </span>
                  {isSelected && <Check size={17} aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          <dl className="ca-client-stats">
            <div><dt>{t('ca.active')}</dt><dd>{selectedBusiness?.activeNoticesCount ?? totalActiveDockets}</dd></div>
            <div><dt>{t('ca.demand')}</dt><dd>{money(selectedBusiness?.totalRisk ?? totalAggregateRisk)}</dd></div>
          </dl>
        </>
      )}
    </aside>
  )
}
