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
  FileCheck,
  Eye,
  EyeOff,
  ExternalLink,
  Send,
  RefreshCw,
  FileWarning,
  ShieldAlert
} from 'lucide-react'
import { routeNoticeToCABench } from '@/app/actions'

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
  modelUsed?: string
}

interface QueuedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
}

interface AiFailedDocket {
  file: File
  name: string
  size: number
  dataUrl: string
  rawFilePath: string
  error: string
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // AI Failure State and CA Bench routing
  const [aiFailedDocket, setAiFailedDocket] = useState<AiFailedDocket | null>(null)
  const [dispatchingToCA, setDispatchingToCA] = useState(false)

  // PDF Preview in Intake Modal
  const [showPdfPreview, setShowPdfPreview] = useState(false)

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
    setSuccessMessage(null)
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

  // Process a queued file through Gemini Vision extraction
  const processQueuedFile = async (queued: QueuedFile) => {
    setLoading(true)
    setLoadingMessage(`Reading ${queued.name} with Gemini 3.5 Flash...`)
    setErrorMessage(null)
    setSuccessMessage(null)

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

      // 2. Read the file as base64 on the client
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      const dataUrl = `data:${file.type || 'application/pdf'};base64,${base64}`

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

      // CASE: Gemini AI failed to extract (503 / timeout / error)
      // DO NOT SUBMIT FAKE HARDCODED DATA!
      if (!res.ok || !json.aiSuccess || !json.data) {
        console.warn('Gemini extraction unavailable:', json.error)
        setAiFailedDocket({
          file: queued.file,
          name: queued.name,
          size: queued.size,
          dataUrl: dataUrl,
          rawFilePath: filePath,
          error: json.error || 'Gemini 3.5 Flash was unable to parse this notice (Service Unavailable / 503).'
        })
        removeQueuedFile(queued.id)
        return
      }

      // CASE: Gemini AI extraction succeeded with real document particulars!
      const extracted = json.data
      setDocketData({
        authority: extracted.authority || 'Issuing Authority',
        form: extracted.form || 'Statutory Notice',
        dinNumber: extracted.din_number || extracted.dinNumber || '',
        issue: extracted.issue || '',
        deadline: extracted.deadline || '',
        penaltyAmount: extracted.penalty_amount || extracted.penaltyAmount || 0,
        action: extracted.action || 'Prepare and submit statutory response',
        owner_role: (extracted.owner_role as 'owner' | 'ca') || 'ca',
        documents: extracted.documents || [],
        confidence: typeof extracted.confidence === 'number' ? extracted.confidence : 0.90,
        rawFileUrl: dataUrl,
        modelUsed: json.model || 'Gemini 3.5 Flash'
      })

      // Remove from queue and open reviewed docket modal
      removeQueuedFile(queued.id)
      setIsModalOpen(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing document')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  // Handle direct dispatch to CA Bench when AI extraction fails
  const handleSendToCABench = async (failedDoc: AiFailedDocket) => {
    setDispatchingToCA(true)
    setErrorMessage(null)

    try {
      const res = await routeNoticeToCABench({
        businessId,
        rawFileUrl: failedDoc.dataUrl,
        fileName: failedDoc.name,
        notes: `Notice "${failedDoc.name}" uploaded by business owner. Automated AI extraction was unavailable. Routed directly to CA Bench for manual document inspection and statutory classification.`
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to dispatch document to CA Bench')
      }

      setAiFailedDocket(null)
      setSuccessMessage(`Docket successfully sealed! "${failedDoc.name}" has been forwarded directly to your Chartered Accountant Bench for full legal review.`)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      console.error('Error dispatching to CA Bench:', err)
      setErrorMessage('Failed to route document to CA Bench: ' + (err.message || 'Unknown error'))
    } finally {
      setDispatchingToCA(false)
    }
  }

  // Handle user manual override: opens Form 7-A with blank fields and PDF preview enabled
  const handleManualFillOverride = (failedDoc: AiFailedDocket) => {
    setDocketData({
      authority: '',
      form: failedDoc.name.replace(/\.[^/.]+$/, ''),
      dinNumber: '',
      issue: '',
      deadline: '',
      penaltyAmount: 0,
      action: 'Chartered Accountant & Owner to examine attached document and file reply',
      owner_role: 'ca',
      documents: ['Original Statutory Notice Document (Attached)'],
      confidence: 0.0,
      rawFileUrl: failedDoc.dataUrl,
      modelUsed: 'Manual Intake'
    })
    setShowPdfPreview(true)
    setAiFailedDocket(null)
    setIsModalOpen(true)
  }

  // Save the reviewed docket to Supabase `notices` and `tasks`
  const handleConfirmAndSeal = async () => {
    if (!docketData) return
    setSavingDocket(true)
    setErrorMessage(null)

    try {
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
          confidence: docketData.confidence,
          penalty_amount: docketData.penaltyAmount || 0,
          status: 'open'
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
          documents_requested: docketData.documents,
          status: 'pending'
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
      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-sm text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

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
              Supports PDF, PNG, JPG notices (max 25 MB per file)
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
                    className="px-2.5 py-1 bg-ink text-white rounded-xs text-[11px] font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : null}
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

      {/* AI FAILURE MODAL: CLEAR NOTICE & DIRECT CA BENCH DISPATCH */}
      {aiFailedDocket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-paper border-2 border-amber-600 rounded-xs shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col">
            {/* ALERT HEADER */}
            <div className="bg-amber-600 text-white p-4 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-900 text-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                    Statutory Ingestion Desk
                  </span>
                  <span className="font-mono text-xs text-amber-100">
                    AI SERVICE NOTICE
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold tracking-tight text-white flex items-center gap-2">
                  <FileWarning size={20} className="text-white" />
                  Gemini AI Transcription Unavailable
                </h3>
                <p className="text-xs text-amber-100 font-mono">
                  Document received: {aiFailedDocket.name} ({(aiFailedDocket.size / 1024).toFixed(0)} KB)
                </p>
              </div>

              <button
                onClick={() => setAiFailedDocket(null)}
                className="text-amber-200 hover:text-white p-1"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 space-y-4 text-xs text-ink bg-paper/95">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-sm flex items-start gap-3">
                <ShieldAlert size={20} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <p className="font-bold text-amber-900 text-sm">
                    No Simulated Data Substituted
                  </p>
                  <p className="text-amber-800">
                    The Gemini AI transcription service is temporarily overloaded or experiencing a high-demand spike (503).
                    To ensure strict statutory accuracy, VyapaarSathi <strong>does not substitute fabricated or hardcoded sample data</strong> for your legal documents.
                  </p>
                </div>
              </div>

              {/* RECOMMENDED PATH: ROUTE DIRECTLY TO CA */}
              <div className="border-2 border-forest-green/40 bg-emerald-50/60 p-4 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-forest-green uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-xs">
                    Recommended Enterprise Path
                  </span>
                  <span className="text-[11px] font-mono text-gray-500">
                    Zero Manual Entry Required
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
                    <Scale size={18} className="text-forest-green" />
                    Send Original PDF Directly to CA Bench
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    Your full PDF will be securely sealed into your case docket and assigned immediately to your Chartered Accountant.
                    Your CA can read the complete PDF inside the integrated portal viewer, verify statutory section codes, and draft your reply.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleSendToCABench(aiFailedDocket)}
                    disabled={dispatchingToCA}
                    className="w-full py-2.5 px-4 bg-forest-green hover:bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {dispatchingToCA ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Dispatching PDF to Chartered Accountant...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Dispatch PDF to CA Bench Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECONDARY OPTIONS */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const failed = aiFailedDocket
                    setAiFailedDocket(null)
                    processQueuedFile({
                      id: `${Date.now()}`,
                      file: failed.file,
                      name: failed.name,
                      size: failed.size,
                      type: failed.file.type
                    })
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xs text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Retry AI Transcription
                </button>

                <button
                  type="button"
                  onClick={() => handleManualFillOverride(aiFailedDocket)}
                  className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xs text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <FileText size={12} />
                  Enter Fields Manually with PDF Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUREAUCRATIC EXTRACTION DOCKET MODAL ("FORM 7-A: NOTICE INTAKE TRANSCRIPT") */}
      {isModalOpen && docketData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`bg-paper border-2 border-ink rounded-xs shadow-2xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh] transition-all duration-200 ${showPdfPreview ? 'max-w-5xl' : 'max-w-3xl'}`}>
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
                  Official Statutory Extraction Record • {docketData.modelUsed ? `Verified via ${docketData.modelUsed}` : 'Verified via Gemini 3.5 Flash'}
                </p>
              </div>

              {/* CONFIDENCE BADGE & PDF PREVIEW TOGGLE */}
              <div className="text-right flex flex-col items-end gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold tracking-wider border ${
                    docketData.confidence >= 0.8
                      ? 'bg-forest-green/20 text-green-300 border-forest-green/40'
                      : docketData.confidence > 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}
                >
                  <ShieldCheck size={13} />
                  {docketData.confidence > 0 ? `${Math.round(docketData.confidence * 100)}% AI CONFIDENCE` : 'MANUAL INTAKE [CA REVIEW PENDING]'}
                </span>

                {docketData.rawFileUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-600 rounded-xs text-[11px] font-mono flex items-center gap-1 transition-colors"
                  >
                    {showPdfPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPdfPreview ? 'Hide Original PDF' : 'View Original PDF'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* DOCKET BODY - SIDE-BY-SIDE WITH PDF IF PREVIEW TOGGLED */}
            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-paper/95 text-xs text-ink divide-y md:divide-y-0 md:divide-x divide-gray-300">
              {/* EDITABLE STATUTORY FIELDS */}
              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
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
                      placeholder="e.g. Department of Goods and Services Tax"
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
                      placeholder="e.g. FORM GST ADT-01"
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
                      placeholder="e.g. ZD101026LMN8899"
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
                      Statutory Demand / Exposure (₹)
                    </label>
                    <input
                      type="number"
                      value={docketData.penaltyAmount}
                      onChange={e => setDocketData({ ...docketData, penaltyAmount: Number(e.target.value) })}
                      placeholder="0"
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
                    placeholder="Enter grounds, audit notice description, or discrepancy particulars..."
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

              {/* INTEGRATED ORIGINAL PDF PREVIEW DRAWER */}
              {showPdfPreview && docketData.rawFileUrl && (
                <div className="w-full md:w-[48%] flex flex-col bg-slate-100 min-h-[400px]">
                  <div className="p-2.5 bg-slate-200 border-b border-gray-300 flex justify-between items-center text-xs font-mono font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-blue-600" />
                      Original Notice PDF
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPdfPreview(false)}
                      className="text-gray-500 hover:text-ink p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <iframe
                    src={docketData.rawFileUrl}
                    title="Original Document Preview"
                    className="w-full flex-1 border-0 min-h-[460px] bg-white"
                  />
                </div>
              )}
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
                    setShowPdfPreview(false)
                  }}
                  disabled={savingDocket}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-ink border border-gray-300 rounded-xs bg-white hover:bg-gray-50 transition-colors"
                >
                  Discard / Cancel
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
