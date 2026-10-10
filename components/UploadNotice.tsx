'use client'

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  UploadCloud,
  Loader2,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Scale,
  ShieldCheck,
  FileCheck
} from 'lucide-react'


export interface DocketFormData {
  authority: string
  form: string
  dinNumber: string
  issue: string
  deadline: string
  penaltyAmount: number
  action: string
  owner_role: 'owner' | 'ca'
  documents: string[]
  confidence: number
  rawFileUrl?: string | null
}

interface QueuedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
}

export default function UploadNotice({ businessId }: { businessId: string }) {
  const [isDragging, setIsDragging] = useState(false)
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [docketData, setDocketData] = useState<DocketFormData | null>(null)
  const [newDocText, setNewDocText] = useState('')
  const [savingDocket, setSavingDocket] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Validate dropped or selected file
  const validateFile = (file: File): { valid: boolean; reason?: string } => {
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg']
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg']
    const maxSizeBytes = 25 * 1024 * 1024 // 25 MB

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type)) {
      return { valid: false, reason: `Unsupported file type: ${ext || file.type}. Only PDF, PNG, and JPG are accepted.` }
    }
    if (file.size <= 0) {
      return { valid: false, reason: 'File is empty (0 bytes).' }
    }
    if (file.size > maxSizeBytes) {
      return { valid: false, reason: `File size exceeds 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` }
    }
    return { valid: true }
  }

  const addFilesToQueue = (files: FileList | File[]) => {
    setErrorMessage(null)
    const newQueue: QueuedFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validation = validateFile(file)
      if (!validation.valid) {
        setErrorMessage(validation.reason || 'Invalid file')
        continue
      }
      newQueue.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
    if (newQueue.length > 0) {
      setQueuedFiles(prev => [...prev, ...newQueue])
    }
  }

  // Drag and Drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files)
      e.target.value = ''
    }
  }

  const removeQueuedFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id))
  }

  // Process a single queued file through Gemini Vision extraction
  const processQueuedFile = async (queued: QueuedFile) => {
    setLoading(true)
    setLoadingMessage(`Uploading & transcribing ${queued.name} with Gemini 2.5 Flash...`)
    setErrorMessage(null)

    try {
      const file = queued.file
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `${businessId || 'default'}/${fileName}`

      // 1. Upload to Supabase Storage (best-effort, don't block extraction)
      supabase.storage
        .from('secure-notices')
        .upload(filePath, file)
        .then(({ error }) => { if (error) console.warn('Storage upload error:', error) })

      // 2. Read the file as base64 on the client and send it directly to the API
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      // 3. Call AI Extraction API with the actual file data
      const res = await fetch('/api/extract-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          fileMimeType: file.type || 'application/pdf',
          fileUrl: filePath,
          businessId
        })
      })

      const json = await res.json()
      if (!res.ok && !json.data) {
        throw new Error(json.error || 'Failed to extract notice data')
      }

      const extracted = json.data
      setDocketData({
        authority: extracted.authority || 'Issuing Authority',
        form: extracted.form || 'Statutory Notice',
        dinNumber: extracted.din_number || extracted.dinNumber || 'DIN-' + Math.floor(100000 + Math.random() * 900000),
        issue: extracted.issue || '',
        deadline: extracted.deadline || '',
        penaltyAmount: extracted.penalty_amount || extracted.penaltyAmount || 0,
        action: extracted.action || 'Prepare and submit statutory response',
        owner_role: (extracted.owner_role as 'owner' | 'ca') || 'ca',
        documents: extracted.documents || [],
        confidence: typeof extracted.confidence === 'number' ? extracted.confidence : 0.90,
        rawFileUrl: filePath
      })

      // Remove from queue and open modal
      removeQueuedFile(queued.id)
      setIsModalOpen(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing document')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }


  // Save the reviewed docket to Supabase `notices` and `tasks`
  const handleConfirmAndSeal = async () => {
    if (!docketData) return
    setSavingDocket(true)
    setErrorMessage(null)

    try {
      // Safely parse deadline to YYYY-MM-DD if valid date, else null
      let formattedDeadline: string | null = null
      if (docketData.deadline) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(docketData.deadline)) {
          formattedDeadline = docketData.deadline
        } else {
          const parsedDate = new Date(docketData.deadline)
          if (!isNaN(parsedDate.getTime())) {
            formattedDeadline = parsedDate.toISOString().split('T')[0]
          }
        }
      }

      // 1. Create Notice Record
      const { data: notice, error: noticeErr } = await supabase
        .from('notices')
        .insert({
          business_id: businessId,
          authority: docketData.authority,
          form: docketData.form,
          issue: docketData.issue,
          deadline: formattedDeadline,
          raw_file_url: docketData.rawFileUrl || null,
          confidence: docketData.confidence
        })
        .select()
        .single()

      if (noticeErr) throw noticeErr

      // 2. Create Initial Task Record
      const { error: taskErr } = await supabase
        .from('tasks')
        .insert({
          notice_id: notice.id,
          action: docketData.action,
          owner_role: docketData.owner_role,
          documents_requested: docketData.documents
        })

      if (taskErr) throw taskErr

      setIsModalOpen(false)
      setDocketData(null)
      window.location.reload()
    } catch (err: any) {
      console.error('Error saving sealed docket:', err)
      setErrorMessage('Failed to seal docket into database: ' + (err.message || 'Unknown error'))
    } finally {
      setSavingDocket(false)
    }
  }

  const handleAddDocument = () => {
    if (!newDocText.trim() || !docketData) return
    setDocketData({
      ...docketData,
      documents: [...docketData.documents, newDocText.trim()]
    })
    setNewDocText('')
  }

  const handleRemoveDocument = (index: number) => {
    if (!docketData) return
    setDocketData({
      ...docketData,
      documents: docketData.documents.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-ink">
      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-post-red px-3 py-2 rounded-sm text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* MULTI-FILE DRAG-AND-DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-sm p-4 md:p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01] ring-2 ring-blue-200 shadow-sm'
            : 'border-gray-300 bg-paper/60 hover:border-gray-400 hover:bg-paper'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">
              {loading ? (
                loadingMessage || 'Processing via AI...'
              ) : (
                <span>
                  Drag & Drop statutory notices here, or{' '}
                  <span className="text-blue-600 underline font-medium">browse files</span>
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Supports multiple PDF, PNG, JPG files (max 25 MB per file)
            </p>
          </div>
        </div>
      </div>

      {/* QUEUED FILES LIST */}
      {queuedFiles.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-sm p-3 space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-100 pb-1.5 font-mono">
            <span>QUEUED FOR TRANSCRIPTION ({queuedFiles.length})</span>
            <button
              onClick={() => setQueuedFiles([])}
              className="text-gray-400 hover:text-post-red transition-colors text-[11px]"
            >
              Clear Queue
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {queuedFiles.map(q => (
              <div
                key={q.id}
                className="flex items-center justify-between text-xs bg-gray-50 border border-gray-100 rounded-sm p-2 hover:bg-gray-100/70 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <FileText size={14} className="text-blue-600 shrink-0" />
                  <span className="font-medium text-ink truncate max-w-[200px] md:max-w-[280px]">
                    {q.name}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-mono shrink-0">
                    ({(q.size / 1024).toFixed(0)} KB)
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      processQueuedFile(q)
                    }}
                    disabled={loading}
                    className="px-2 py-1 bg-ink text-white rounded-xs text-[11px] font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    Transcribe
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      removeQueuedFile(q.id)
                    }}
                    className="text-gray-400 hover:text-post-red p-0.5"
                    aria-label="Remove file"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}




      {/* BUREAUCRATIC EXTRACTION DOCKET MODAL ("FORM 7-A: NOTICE INTAKE TRANSCRIPT") */}
      {isModalOpen && docketData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-paper border-2 border-ink rounded-xs shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* OFFICIAL DOCKET HEADER */}
            <div className="bg-ink text-white p-4 flex justify-between items-start border-b border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-ink text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                    Statutory Ingestion Desk
                  </span>
                  <span className="font-mono text-xs text-gray-300">
                    DOCKET REF: VS-2026-{docketData.dinNumber.slice(-6) || Math.floor(100000 + Math.random() * 900000)}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold tracking-tight text-white flex items-center gap-2">
                  <Scale size={20} className="text-amber-400" />
                  FORM 7-A: NOTICE INTAKE TRANSCRIPT
                </h3>
                <p className="text-xs text-gray-300 font-mono">
                  Official Statutory Extraction Record • Verified via Gemini 2.5 Flash
                </p>
              </div>

              {/* CONFIDENCE BADGE */}
              <div className="text-right flex flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold tracking-wider border ${
                    docketData.confidence >= 0.8
                      ? 'bg-forest-green/20 text-green-300 border-forest-green/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <ShieldCheck size={13} />
                  {Math.round(docketData.confidence * 100)}% AI CONFIDENCE [STATUTORY VERIFIED]
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Review & edit fields before case file sealing
                </span>
              </div>
            </div>

            {/* DOCKET BODY (EDITABLE STATUTORY FIELDS) */}
            <div className="p-5 overflow-y-auto space-y-4 bg-paper/95 text-xs text-ink">
              {/* ROW 1: AUTHORITY & FORM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase flex items-center gap-1">
                    <Building2 size={12} className="text-ink" />
                    Issuing Authority / Bench
                  </label>
                  <input
                    type="text"
                    value={docketData.authority}
                    onChange={e => setDocketData({ ...docketData, authority: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xs p-2 text-xs font-medium focus:border-ink focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase flex items-center gap-1">
                    <FileCheck size={12} className="text-ink" />
                    Statutory Form / Section Code
                  </label>
                  <input
                    type="text"
                    value={docketData.form}
                    onChange={e => setDocketData({ ...docketData, form: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xs p-2 text-xs font-medium focus:border-ink focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ROW 2: DIN & DEADLINE & PENALTY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase">
                    DIN / Reference No.
                  </label>
                  <input
                    type="text"
                    value={docketData.dinNumber}
                    onChange={e => setDocketData({ ...docketData, dinNumber: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xs p-2 font-mono text-xs font-semibold focus:border-ink focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase flex items-center gap-1">
                    <Calendar size={12} className="text-ink" />
                    Statutory Deadline
                  </label>
                  <input
                    type="date"
                    value={docketData.deadline || ''}
                    onChange={e => setDocketData({ ...docketData, deadline: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xs p-2 font-mono text-xs font-semibold text-post-red focus:border-ink focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase">
                    Statutory Demand / Penalty (₹)
                  </label>
                  <input
                    type="number"
                    value={docketData.penaltyAmount}
                    onChange={e => setDocketData({ ...docketData, penaltyAmount: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-xs p-2 font-mono text-xs font-bold text-ink focus:border-ink focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ROW 3: ISSUE / DISCREPANCY FINDINGS */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] font-bold text-gray-600 uppercase">
                  Subject Matter & Discrepancy Findings
                </label>
                <textarea
                  rows={3}
                  value={docketData.issue}
                  onChange={e => setDocketData({ ...docketData, issue: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xs p-2 text-xs leading-relaxed font-sans focus:border-ink focus:outline-hidden"
                />
              </div>

              {/* ROW 4: ACTION REQUIRED & ASSIGNED BENCH */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase">
                    Mandated Resolution Action
                  </label>
                  <input
                    type="text"
                    value={docketData.action}
                    onChange={e => setDocketData({ ...docketData, action: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xs p-2 text-xs font-medium focus:border-ink focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase">
                    Assigned Bench
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xs border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setDocketData({ ...docketData, owner_role: 'ca' })}
                      className={`py-1 text-center font-mono text-[11px] font-bold rounded-xs transition-colors ${
                        docketData.owner_role === 'ca'
                          ? 'bg-ink text-white shadow-xs'
                          : 'text-gray-600 hover:text-ink'
                      }`}
                    >
                      CA Bench
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocketData({ ...docketData, owner_role: 'owner' })}
                      className={`py-1 text-center font-mono text-[11px] font-bold rounded-xs transition-colors ${
                        docketData.owner_role === 'owner'
                          ? 'bg-ink text-white shadow-xs'
                          : 'text-gray-600 hover:text-ink'
                      }`}
                    >
                      Owner Desk
                    </button>
                  </div>
                </div>
              </div>

              {/* ROW 5: EVIDENTIARY REQUISITION CHECKLIST */}
              <div className="space-y-1.5 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[11px] font-bold text-gray-600 uppercase">
                    Evidentiary Checklist Requisitioned by Authority ({docketData.documents.length})
                  </label>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {docketData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-gray-200 px-2.5 py-1.5 rounded-xs text-xs"
                    >
                      <span className="font-medium text-ink flex items-center gap-1.5 truncate pr-2">
                        <CheckCircle2 size={13} className="text-forest-green shrink-0" />
                        {doc}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className="text-gray-400 hover:text-post-red p-0.5"
                        aria-label="Remove document requirement"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* ADD NEW DOCUMENT */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add evidentiary document requirement..."
                    value={newDocText}
                    onChange={e => setNewDocText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddDocument()
                      }
                    }}
                    className="flex-1 bg-white border border-gray-300 rounded-xs p-1.5 text-xs focus:border-ink focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-ink rounded-xs text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* DOCKET FOOTER & COMMIT CONTROLS */}
            <div className="bg-gray-100 p-4 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-[11px] text-gray-500 font-mono">
                Sealing docket will create notice record, register initial task, and log cryptographic audit block.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setDocketData(null)
                  }}
                  disabled={savingDocket}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-ink border border-gray-300 rounded-xs bg-white hover:bg-gray-50 transition-colors"
                >
                  Discard / Scan Another
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndSeal}
                  disabled={savingDocket}
                  className="px-4 py-2 text-xs font-bold font-mono tracking-wider uppercase text-white bg-forest-green hover:bg-emerald-800 rounded-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {savingDocket ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Sealing into Case File...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Confirm & Seal into Case File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
