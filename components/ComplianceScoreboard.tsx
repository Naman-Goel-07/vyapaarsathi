'use client'

import React, { useState } from 'react'
import {
  Award,
  CheckCircle2,
  FileCheck,
  Building,
  Printer,
  ShieldCheck,
  Download,
  X,
  ExternalLink,
  Percent,
  Sparkles
} from 'lucide-react'

export default function ComplianceScoreboard() {
  const [showCertificate, setShowCertificate] = useState(false)

  const certHash = 'SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'

  return (
    <>
      <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-forest-green text-white text-[10px] font-mono px-2 py-0.5 rounded-xs uppercase tracking-wider font-bold flex items-center gap-1">
              <Award size={11} /> The Scoreboard
            </span>
            <span className="text-xs font-mono text-gray-500 font-semibold">
              Slide 10 Roadmap Delivery
            </span>
          </div>

          <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
            Vyapaar Compliance Health Score
          </h3>

          <p className="text-xs text-gray-600 max-w-xl">
            Unified statutory compliance index across GST, Municipal, and Labour authorities. Verified for commercial loan appraisals.
          </p>
        </div>

        {/* COMPLIANCE RATING & SCORE DIAL */}
        <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full border-4 border-forest-green flex items-center justify-center bg-forest-green/5">
              <span className="font-mono text-lg font-bold text-forest-green">94</span>
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-ink">AAA / BANKABLE</p>
              <p className="text-[10px] text-gray-400 font-mono">0 Default Flags</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>

          <button
            onClick={() => setShowCertificate(true)}
            className="px-3.5 py-2 bg-ink hover:bg-slate-800 text-white font-mono text-xs font-bold rounded-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCheck size={14} />
            <span>Lender Certificate</span>
          </button>
        </div>
      </div>

      {/* LENDER COMPLIANCE CERTIFICATE MODAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] border-2 border-ink rounded-xs shadow-2xl w-full max-w-2xl my-6 flex flex-col max-h-[90vh] overflow-hidden text-ink">
            {/* CERTIFICATE HEADER BAR */}
            <div className="bg-ink text-white p-4 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-400" />
                <h4 className="font-serif font-bold text-sm uppercase tracking-wider">
                  Official Banker / Lender Compliance Certificate
                </h4>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* CERTIFICATE DOCUMENT BODY */}
            <div className="p-8 space-y-6 overflow-y-auto font-serif text-xs leading-relaxed border-8 border-double border-gray-200 m-4 bg-white shadow-xs">
              <div className="text-center space-y-1 border-b-2 border-ink pb-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                  GOVERNMENT OF INDIA STATUTORY REPOSITORIES SYNTHESIS
                </span>
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  CERTIFICATE OF STATUTORY COMPLIANCE
                </h2>
                <p className="text-[11px] font-mono text-gray-600">
                  ISSUED UNDER VYAPAARSATHI REGISTRY INTEGRATION · FOR BANK / NBFC CREDIT APPRAISAL
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-[11px] py-2 border-b border-gray-100">
                <div>
                  <p><strong>ENTITY:</strong> Registered MSME Trader</p>
                  <p><strong>UDYAM REG:</strong> UDYAM-DL-03-0092819</p>
                  <p><strong>GSTIN:</strong> 07AABCV1234F1Z9</p>
                </div>
                <div className="text-right">
                  <p><strong>SCORE:</strong> 94 / 100 (GRADE AAA)</p>
                  <p><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                  <p><strong>STATUS:</strong> ZERO UNCAPPED DEFAULTS</p>
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <p className="font-serif italic text-gray-700">
                  This document certifies that the statutory compliance standing of the aforementioned entity has been algorithmically cross-verified across the following regulatory benches:
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={13} className="text-forest-green" /> GST Department (Central & State Tax)
                    </span>
                    <span className="text-forest-green font-bold">92% · Active Docket In Clarification</span>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={13} className="text-forest-green" /> Municipal Body (Trade License & Health)
                    </span>
                    <span className="text-forest-green font-bold">100% · Fully Renewed</span>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={13} className="text-forest-green" /> Labour, EPF & MCA Bench
                    </span>
                    <span className="text-forest-green font-bold">98% · Periodic Returns Lodged</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex justify-between items-end font-mono text-[10px] text-gray-500">
                <div>
                  <p className="font-bold text-gray-800">CRYPTOGRAPHIC SIGNATURE HASH:</p>
                  <p className="break-all">{certHash}</p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-12 border border-dashed border-gray-300 flex items-center justify-center text-[9px] uppercase font-bold text-gray-400">
                    [ OFFICIAL SEAL ]
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-gray-100 border-t border-gray-300 flex justify-between items-center">
              <span className="text-[11px] font-mono text-gray-500">
                Lender verification URL active: vyapaarsathi.in/verify/94-aaa
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-xs text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-gray-50"
                >
                  <Printer size={13} /> Print Certificate
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-4 py-1.5 bg-ink text-white rounded-xs text-xs font-mono font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
