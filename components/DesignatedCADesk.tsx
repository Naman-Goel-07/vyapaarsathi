'use client'

import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Building2,
  Briefcase,
  Mail,
  ShieldCheck,
  ChevronDown,
  Check,
  ArrowRight,
  ExternalLink,
  Users
} from 'lucide-react'

import { assignCAToBusiness, unassignCAFromBusiness } from '@/app/actions'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/lib/context/LanguageContext'

export interface CAProfile {
  id: string
  name: string
  email: string
  membershipNo?: string
  firm?: string
  specialization?: string
}

interface DesignatedCADeskProps {
  businessName?: string
  businessId?: string
  initialCA?: CAProfile | null
}

export default function DesignatedCADesk({
  businessName = 'My Enterprise',
  businessId,
  initialCA
}: DesignatedCADeskProps) {
  const { t, lang } = useLanguage()
  const [assignedCA, setAssignedCA] = useState<CAProfile | null>(initialCA || null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [caName, setCaName] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  // Keep assignedCA in sync with server initialCA
  useEffect(() => {
    if (initialCA) {
      setAssignedCA(initialCA)
    }
  }, [initialCA])

  const handleAssignCA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail || !customEmail.includes('@') || !businessId) return

    setIsVerifying(true)
    setErrorMessage(null)

    try {
      const result = await assignCAToBusiness(businessId, customEmail, caName)

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to verify Chartered Accountant.')
        setIsVerifying(false)
        return
      }

      setAssignedCA(result.ca as CAProfile)
      setIsModalOpen(false)
      setCustomEmail('')
      setCaName('')
      setIsVerifying(false)
      setNotification(`Verified Chartered Accountant (${result.ca?.email}) successfully linked to ${businessName} in database.`)
      setTimeout(() => setNotification(null), 5000)
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during verification.')
      setIsVerifying(false)
    }
  }

  const handleRemoveCA = async () => {
    if (!businessId) return
    await unassignCAFromBusiness(businessId)
    setAssignedCA(null)
    setNotification(`Removed assigned CA representation for ${businessName}.`)
    setTimeout(() => setNotification(null), 4000)
  }

  return (
    <div className="bg-white border-2 border-ink rounded-sm shadow-sm overflow-hidden text-ink">
      {/* Top Banner */}
      <div className="bg-ink text-white px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-amber-400 shrink-0" />
          <span className="font-mono text-xs uppercase tracking-wider text-gray-300">
            {lang === 'hi' ? 'पंजीकृत उद्यम:' : 'Registered Enterprise:'}
          </span>
          <span className="font-bold text-sm text-white font-serif tracking-wide">{businessName}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
          <span className={`w-2 h-2 rounded-full ${assignedCA ? 'bg-forest-green animate-pulse' : 'bg-gray-400'}`}></span>
          <span>
            {assignedCA
              ? (lang === 'hi' ? 'सलाहकार अनुबंधित' : 'Counsel Retained')
              : (lang === 'hi' ? 'कोई सीए नियुक्त नहीं' : 'No CA Assigned')}
          </span>
        </div>
      </div>

      {notification && (
        <div className="bg-forest-green/10 border-b border-forest-green/20 px-5 py-2.5 text-xs text-forest-green font-mono flex items-center justify-between">
          <span>✓ {notification}</span>
          <button onClick={() => setNotification(null)} className="font-bold underline cursor-pointer ml-3">
            {lang === 'hi' ? 'हटाएं' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Main Counsel Display Card */}
      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-50 border-2 border-ink rounded-sm flex items-center justify-center shrink-0">
            <UserCheck size={24} className="text-ink" />
          </div>

          <div className="space-y-1">
            {assignedCA ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif font-bold text-base text-ink">{assignedCA.name}</span>
                  <span className="bg-green-100 text-forest-green border border-green-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs flex items-center gap-1">
                    <ShieldCheck size={11} /> {lang === 'hi' ? 'अनुबंधित सलाहकार' : 'Retained Counsel'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 font-mono flex items-center gap-2">
                  <Mail size={12} className="text-gray-400" />
                  <span>{assignedCA.email}</span>
                </p>

                <p className="text-[11px] text-gray-500 font-mono">
                  {lang === 'hi'
                    ? `${businessName} के सभी वैधानिक नोटिस इस सलाहकार को सौंपे गए हैं।`
                    : `All statutory notices uploaded for ${businessName} are delegated to this counsel.`}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-serif font-bold text-base text-gray-700">
                  {lang === 'hi' ? 'कोई चार्टर्ड एकाउंटेंट नियुक्त नहीं है' : 'No Chartered Accountant Assigned'}
                </h4>
                <p className="text-xs text-gray-500 font-mono">
                  {lang === 'hi'
                    ? 'अनुपालन फाइलिंग और वैधानिक जवाब सौंपने के लिए अपने सीए को ईमेल द्वारा जोड़ें।'
                    : 'Connect your CA by email to delegate compliance filings and statutory replies.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full md:w-auto shrink-0 flex items-center gap-2 justify-end">
          {assignedCA && (
            <button
              onClick={handleRemoveCA}
              className="px-3 py-2 bg-white hover:bg-red-50 text-post-red border border-red-300 rounded-sm text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              {lang === 'hi' ? 'हटाएं' : 'Unassign'}
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-ink hover:bg-slate-800 text-white rounded-sm text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Users size={14} />
            <span>
              {assignedCA
                ? (lang === 'hi' ? 'सीए बदलें' : 'Change CA')
                : (lang === 'hi' ? 'चार्टर्ड एकाउंटेंट नियुक्त करें' : 'Assign Chartered Accountant')}
            </span>
          </button>
        </div>
      </div>

      {/* MODAL: ASSIGN CHARTERED ACCOUNTANT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border-2 border-ink rounded-sm shadow-2xl max-w-md w-full flex flex-col overflow-hidden text-ink">
            <div className="bg-ink text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base">
                  {lang === 'hi' ? 'चार्टर्ड एकाउंटेंट नामित करें' : 'Assign Chartered Accountant'}
                </h3>
                <p className="text-xs font-mono text-gray-300">
                  {lang === 'hi'
                    ? `${businessName} के लिए कानूनी सलाहकार नामित करें`
                    : `Designate legal counsel for ${businessName}`}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-mono text-lg font-bold px-2 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignCA} className="p-5 space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 uppercase tracking-wider block">
                  {lang === 'hi' ? 'चार्टर्ड एकाउंटेंट का ईमेल' : 'Chartered Accountant Email'} <span className="text-post-red">*</span>:
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ca.kumar@accountants.in or test@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink font-sans text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 uppercase tracking-wider block">
                  {lang === 'hi' ? 'सीए का पूरा नाम / फर्म का नाम (वैकल्पिक):' : 'CA Name / Firm Name (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. CA Rajesh Sharma (Sharma & Co)"
                  value={caName}
                  onChange={(e) => setCaName(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3 py-2 rounded-sm focus:outline-none focus:border-ink font-sans text-sm"
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-post-red/40 p-3 rounded text-post-red text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <div className="bg-gray-100 p-3 rounded border border-gray-200 text-gray-600 text-[11px] leading-relaxed">
                ℹ️ {lang === 'hi'
                  ? 'असाइन करने पर, सिस्टम पुष्टि करता है कि यह सीए डेटाबेस में पंजीकृत है और उन्हें तुरंत केस एक्सेस प्रदान करता है।'
                  : "When assigned, the system verifies that this CA is registered with role 'ca' in Supabase and links their ID in the database."}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setErrorMessage(null)
                  }}
                  className="px-3 py-1.5 text-gray-600 hover:text-ink cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!customEmail.trim() || isVerifying}
                  className="bg-ink hover:bg-slate-800 disabled:opacity-40 text-white px-4 py-1.5 font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>{lang === 'hi' ? 'डेटाबेस में सत्यापन जारी...' : 'Verifying Database...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'hi' ? 'सत्यापित करें व सीए नियुक्त करें' : 'Verify & Assign CA'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
