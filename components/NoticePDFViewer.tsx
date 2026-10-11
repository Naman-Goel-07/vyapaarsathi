'use client'

import React, { useState } from 'react'
import {
  FileText,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Loader2,
  Scale,
  Calendar,
  Building2,
  ShieldCheck
} from 'lucide-react'
import { updateNoticeParticulars } from '@/app/actions'

interface NoticePDFViewerProps {
  noticeId: string
  rawFileUrl?: string | null
  authority: string
  form: string
  issue: string
  deadline?: string | null
  penaltyAmount?: number
  confidence?: number
  userRole?: 'owner' | 'ca'
}

export default function NoticePDFViewer({
  noticeId,
  rawFileUrl,
  authority,
  form,
  issue,
  deadline,
  penaltyAmount = 0,
  confidence = 0,
  userRole = 'owner'
}: NoticePDFViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Editable fields state
  const [editAuthority, setEditAuthority] = useState(authority)
  const [editForm, setEditForm] = useState(form)
  const [editIssue, setEditIssue] = useState(issue)
  const [editDeadline, setEditDeadline] = useState(deadline || '')
  const [editPenalty, setEditPenalty] = useState(penaltyAmount)

  const isRawDispatch = !confidence || confidence === 0 || form.includes('Direct') || form.includes('Unclassified')

  const handleSaveParticulars = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage(null)

    try {
      const res = await updateNoticeParticulars({
        noticeId,
        authority: editAuthority,
        form: editForm,
        issue: editIssue,
        deadline: editDeadline || null,
        penaltyAmount: Number(editPenalty) || 0
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to save particulars')
      }

      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => {
        setSaveSuccess(false)
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating statutory particulars')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenNewTab = () => {
    if (!rawFileUrl) return
    if (rawFileUrl.startsWith('data:application/pdf;base64,')) {
      const base64Data = rawFileUrl.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } else {
      window.open(rawFileUrl, '_blank')
    }
  }

  const handleDownload = () => {
    if (!rawFileUrl) return
    const a = document.createElement('a')
    a.href = rawFileUrl
    a.download = `${form.replace(/[^a-zA-Z0-9_-]/g, '_')}_Document.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden space-y-0">
      {/* HEADER BAR */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <FileText size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-serif tracking-tight text-white">
                Original Statutory Notice Document
              </h3>
              {rawFileUrl && (
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-sm">
                  PDF ATTACHED
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              Official evidentiary intake record for CA legal bench examination
            </p>
          </div>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {rawFileUrl && (
            <>
              <button
                onClick={handleOpenNewTab}
                title="Open PDF in new browser tab"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={13} />
                <span className="hidden md:inline">Open in Tab</span>
              </button>

              <button
                onClick={handleDownload}
                title="Download PDF to computer"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span className="hidden md:inline">Download</span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse viewer' : 'Expand viewer'}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span className="hidden md:inline">{isExpanded ? 'Collapse' : 'Full Height'}</span>
              </button>
            </>
          )}

          {userRole === 'ca' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded text-xs font-mono flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Edit3 size={13} />
              <span>Certify Particulars</span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER FOR DIRECT UNCLASSIFIED DISPATCHES */}
      {isRawDispatch && (
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-900">
              Direct CA Bench Dispatch — Original Document Awaiting CA Classification
            </p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              This notice was routed directly to the Chartered Accountant desk without simulated AI data.
              As the designated CA, please inspect the original PDF document below, determine the exact statutory section/form,
              and certify the verified statutory deadline and demand amount.
            </p>
          </div>
          {userRole === 'ca' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shrink-0"
            >
              Edit Particulars
            </button>
          )}
        </div>
      )}

      {/* CA EDIT PARTICULARS MODAL / DRAWER */}
      {isEditing && (
        <form onSubmit={handleSaveParticulars} className="bg-slate-50 border-b border-gray-200 p-4 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-slate-800" />
              <h4 className="font-bold text-slate-900 font-serif text-sm">
                CA Certification of Statutory Particulars
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          </div>

          {errorMessage && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-gray-600 uppercase flex items-center gap-1">
                <Building2 size={11} /> Issuing Authority
              </label>
              <input
                type="text"
                value={editAuthority}
                onChange={e => setEditAuthority(e.target.value)}
                placeholder="e.g. Department of Goods and Services Tax"
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-medium focus:border-slate-800 focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-gray-600 uppercase flex items-center gap-1">
                <FileText size={11} /> Statutory Form / Notice Code
              </label>
              <input
                type="text"
                value={editForm}
                onChange={e => setEditForm(e.target.value)}
                placeholder="e.g. FORM GST ADT-01"
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-medium focus:border-slate-800 focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-gray-600 uppercase flex items-center gap-1">
                <Calendar size={11} /> Statutory Compliance Deadline
              </label>
              <input
                type="date"
                value={editDeadline}
                onChange={e => setEditDeadline(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-xs font-semibold text-red-600 focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] font-bold text-gray-600 uppercase">
                Statutory Demand / Exposure (₹)
              </label>
              <input
                type="number"
                value={editPenalty}
                onChange={e => setEditPenalty(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-white border border-gray-300 rounded p-2 font-mono text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-mono text-[10px] font-bold text-gray-600 uppercase">
                Statutory Subject Matter & Audit/Scrutiny Scope
              </label>
              <textarea
                rows={2}
                value={editIssue}
                onChange={e => setEditIssue(e.target.value)}
                placeholder="e.g. Notice for conducting audit under Section 65 of CGST Act, 2017 for FY 2024-25"
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-medium focus:border-slate-800 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 rounded text-xs font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Save & Certify Particulars
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {saveSuccess && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-2 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600" />
          Statutory particulars certified and saved to case file!
        </div>
      )}

      {/* PDF VIEWER EMBED */}
      <div className="relative bg-slate-100 min-h-[480px]">
        {rawFileUrl ? (
          <div className={`w-full transition-all duration-300 ${isExpanded ? 'h-[85vh]' : 'h-[520px]'}`}>
            <iframe
              src={rawFileUrl}
              title="Official Notice PDF Viewer"
              className="w-full h-full border-0 rounded-b-xl bg-slate-200"
            />
          </div>
        ) : (
          <div className="p-12 text-center space-y-3 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-400">
              <FileText size={24} />
            </div>
            <p className="font-semibold text-sm text-gray-700">No Document File Attached</p>
            <p className="text-xs max-w-md mx-auto text-gray-500">
              This notice docket was registered without a raw PDF attachment. Any future uploaded documents will be accessible in this viewer.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER AUDIT BAR */}
      <div className="bg-slate-50 px-4 py-2 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono text-gray-500 gap-1">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-600" />
          Evidentiary Integrity: Cryptographically hashed original intake block
        </span>
        <span className="text-gray-400">
          ID: {noticeId}
        </span>
      </div>
    </div>
  )
}
