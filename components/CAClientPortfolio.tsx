'use client'

import React from 'react'
import { Building2, Briefcase, AlertCircle, ShieldAlert, CheckCircle, ArrowRight, Layers } from 'lucide-react'

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
  const totalClients = businesses.length
  const totalAggregateRisk = businesses.reduce((acc, b) => acc + (b.totalRisk || 0), 0)
  const totalActiveDockets = businesses.reduce((acc, b) => acc + (b.activeNoticesCount || 0), 0)

  return (
    <div className="bg-white border-2 border-ink rounded-sm shadow-sm overflow-hidden text-ink space-y-0">
      {/* Top Header Bar */}
      <div className="bg-ink text-white px-5 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h3 className="font-serif font-bold text-base tracking-wide">Client Business Portfolio</h3>
            <span className="bg-white/10 text-gray-300 text-[10px] font-mono px-2 py-0.5 rounded-xs border border-white/20">
              {totalClients} Retained Entities
            </span>
          </div>
          <p className="text-xs font-mono text-gray-300 mt-0.5">
            Chartered Accountant Representation Ledger · Direct Statutory Jurisdiction
          </p>
        </div>

        {/* Global Aggregate Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Aggregate Exposure</span>
            <span className="font-bold text-amber-400">₹{totalAggregateRisk.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-px h-6 bg-gray-700"></div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Dockets</span>
            <span className="font-bold text-white">{totalActiveDockets} Pending</span>
          </div>
        </div>
      </div>

      {/* Filter / Client Selection Bar */}
      <div className="p-4 bg-paper border-b border-gray-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-600">
          <span>PORTFOLIO SCOPE:</span>
          <button
            onClick={() => onSelectBusiness(null)}
            className={`px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase transition-all ${
              selectedBusinessId === null
                ? 'bg-ink text-white shadow-xs'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-ink'
            }`}
          >
            All Clients ({totalClients})
          </button>
        </div>

        {selectedBusinessId && (
          <span className="text-xs font-mono text-post-red flex items-center gap-1 font-bold">
            <span>● Filter Active</span>
            <button
              onClick={() => onSelectBusiness(null)}
              className="text-gray-500 hover:text-ink underline ml-1 cursor-pointer"
            >
              (Clear Filter)
            </button>
          </span>
        )}
      </div>

      {/* Client Businesses Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {businesses.length === 0 ? (
          <div className="col-span-full py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-sm bg-gray-50/50">
            <Building2 className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <h4 className="font-serif font-bold text-sm text-ink">No Retained Client Entities Yet</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              No business has designated your CA account yet. When a business enters your registered CA email in their &quot;Retained Chartered Accountant&quot; desk, their entity and pending dockets will appear here automatically.
            </p>
          </div>
        ) : (
          businesses.map((biz) => {
            const isSelected = selectedBusinessId === biz.id
            return (
              <div
                key={biz.id}
                onClick={() => onSelectBusiness(isSelected ? null : biz.id)}
                className={`p-4 rounded-sm border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected
                    ? 'border-ink bg-amber-50/40 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-ink text-white text-[9px] font-mono px-2 py-0.5 font-bold uppercase tracking-wider">
                    Selected
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-bold text-sm text-ink truncate pr-14" title={biz.name}>
                      {biz.name}
                    </h4>
                  </div>

                  <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                    <Building2 size={11} className="text-gray-400" />
                    <span>REF: {biz.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase block">Active Dockets</span>
                    <span className="font-bold text-ink flex items-center gap-1">
                      {biz.activeNoticesCount > 0 ? (
                        <span className={biz.hasCritical ? 'text-post-red' : 'text-ink'}>
                          {biz.activeNoticesCount} Notices
                        </span>
                      ) : (
                        <span className="text-forest-green flex items-center gap-1">
                          <CheckCircle size={11} /> 0 Clear
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase block">Monetary Risk</span>
                    <span className="font-bold text-ink">
                      ₹{(biz.totalRisk || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    className={`w-full py-1 text-[11px] font-mono font-bold uppercase rounded-xs border transition-colors ${
                      isSelected
                        ? 'bg-ink text-white border-ink'
                        : 'bg-gray-100 text-gray-700 border-gray-200 group-hover:border-ink'
                    }`}
                  >
                    {isSelected ? '✓ Showing This Client' : 'Focus Client View'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
