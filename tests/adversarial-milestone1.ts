/**
 * VyapaarSathi - Milestone 1 Adversarial Challenge Harness
 *
 * Empirical challenger test suite for Milestone 1 ("The Clerk" AI Intake):
 * 1. Multi-file Dropzone Validation & Queue Resilience Harness
 * 2. Sample Notice Quick-Load Presets & Statutory Integrity Oracle
 * 3. Extraction Endpoint (/api/extract-notice) Edge-Case & Adversarial Payload Stress Harness
 *
 * Written by Challenger 1 for empirical verification.
 */

import { spawn, ChildProcess } from 'node:child_process'
import * as http from 'node:http'
export interface SampleNotice {
  id: string
  title: string
  authority: string
  form: string
  issue: string
  deadline: string
  penaltyAmount: number
  dinNumber: string
  documents: string[]
  sampleText: string
  confidence: number
  action?: string
  owner_role?: 'owner' | 'ca'
}

export const SAMPLE_NOTICES: SampleNotice[] = [
  {
    id: 'gst-drc-01',
    title: 'GST DRC-01 (ITC Mismatch)',
    authority: 'Office of the Deputy Commissioner of State Tax, Special Circle, New Delhi',
    form: 'Form GST DRC-01 (Section 73)',
    issue: 'Discrepancy between GSTR-2B eligible ITC and GSTR-3B claimed ITC for FY 2023-24. Excess ITC claimed amounting to ₹1,85,420 from non-compliant supplier M/s Apex Tech Solutions (GSTIN 07AAAAA0000A1Z5) whose registration was retroactively cancelled.',
    deadline: '2026-11-15',
    penaltyAmount: 237337,
    dinNumber: 'DIN-2026-GST-09281-ND',
    documents: [
      'GSTR-2B vs GSTR-3B monthly reconciliation sheet',
      'Original tax invoices issued by supplier',
      'Bank payment proof of invoice clearance within 180 days (Sec 16(2))',
      'E-Way bills and inward consignment notes'
    ],
    action: 'Prepare and submit response in Form GST DRC-06 with reconciliation annexures and supplier verification certificates.',
    owner_role: 'ca',
    confidence: 0.96,
    sampleText: `FORM GST DRC-01`
  },
  {
    id: 'it-148a',
    title: 'Income Tax 148A (Cash Deposits)',
    authority: 'Office of the Income Tax Officer, Ward 14(1), Mumbai',
    form: 'Notice under Section 148A(b) of the Income-tax Act, 1961',
    issue: 'Reopening of Assessment: High-value cash deposits of ₹42,50,000 detected in Current Account during FY 2022-23 (AY 2023-24) exceeding declared gross turnover by ₹28,00,000. Escapement of income chargeable to tax.',
    deadline: '2026-10-25',
    penaltyAmount: 1318500,
    dinNumber: 'ITBA/AST/S/148A/2026-27/10892014',
    documents: [
      'Audited Profit & Loss Statement & Balance Sheet (AY 2023-24)',
      'Complete Bank Statements for all current accounts with deposit narrations',
      'Cash Book and Day Book ledgers for FY 2022-23',
      'Daily cash sales register and VAT/GST monthly returns'
    ],
    action: 'Submit formal point-by-point rebuttal on IT e-Filing Portal with audited financial cross-references and cash flow statements.',
    owner_role: 'ca',
    confidence: 0.94,
    sampleText: `NOTICE UNDER CLAUSE (b) OF SECTION 148A`
  },
  {
    id: 'epfo-7a',
    title: 'EPFO 7A (PF Arrears & Damages)',
    authority: 'Office of the Regional Provident Fund Commissioner, Bengaluru North',
    form: 'Summons & Notice under Section 7A & 14B, EPF & MP Act, 1952',
    issue: 'Determination of statutory dues and damages: Alleged non-enrollment of 24 contractual security and housekeeping personnel from April 2023 to March 2026 and default in timely remittance of statutory dues.',
    deadline: '2026-11-05',
    penaltyAmount: 427800,
    dinNumber: 'EPFO/RO/BLR-N/7A/2026/4109',
    documents: [
      'Master Attendance Registers for outsourced personnel',
      'Wage / Salary payment sheets (Form 10)',
      'Contractor service agreements and monthly invoices',
      'Bank disbursement proof for staff salaries'
    ],
    action: 'Appear before Assistant PF Commissioner or submit sworn affidavit along with contractor compliance certificates and wage registers.',
    owner_role: 'owner',
    confidence: 0.92,
    sampleText: `SUMMONS UNDER SECTION 7A`
  }
]

export function getSampleNoticeById(id: string): SampleNotice | undefined {
  return SAMPLE_NOTICES.find(n => n.id === id)
}

// ==========================================
// Test Framework Helpers
// ==========================================

interface TestResult {
  suite: string
  name: string
  passed: boolean
  error?: string
  durationMs: number
}

const results: TestResult[] = []

function assert(condition: boolean, msg: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${msg}`)
  }
}

function assertEquals<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${msg} (Expected: ${expected}, Got: ${actual})`)
  }
}

async function test(suite: string, name: string, fn: () => void | Promise<void>): Promise<void> {
  const start = performance.now()
  try {
    await fn()
    const durationMs = Math.round(performance.now() - start)
    results.push({ suite, name, passed: true, durationMs })
    console.log(`  [PASS] [${suite}] ${name} (${durationMs}ms)`)
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - start)
    results.push({ suite, name, passed: false, error: err.message, durationMs })
    console.error(`  [FAIL] [${suite}] ${name} (${durationMs}ms): ${err.message}`)
  }
}

// ==========================================
// 1. Multi-file Dropzone Validation Mock Engine
// (Replicating validateFile logic from UploadNotice.tsx)
// ==========================================

interface MockFile {
  name: string
  size: number
  type: string
}

function validateDropFile(file: MockFile): { valid: boolean; reason?: string } {
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

async function runDropzoneValidationTests() {
  console.log('\n--- [SUITE 1: DROPZONE VALIDATION & QUEUE STRESS HARNESS] ---')

  await test('Dropzone', '0-byte PDF file is rejected with empty file error', () => {
    const res = validateDropFile({ name: 'notice.pdf', size: 0, type: 'application/pdf' })
    assertEquals(res.valid, false, '0-byte file should be invalid')
    assert(Boolean(res.reason?.includes('0 bytes')), `Reason should mention 0 bytes, got: ${res.reason}`)
  })

  await test('Dropzone', 'Negative size file is rejected', () => {
    const res = validateDropFile({ name: 'corrupt.png', size: -1, type: 'image/png' })
    assertEquals(res.valid, false, 'Negative size should be invalid')
    assert(Boolean(res.reason?.includes('0 bytes')), `Reason should mention 0 bytes, got: ${res.reason}`)
  })

  await test('Dropzone', '1-byte PDF file is accepted', () => {
    const res = validateDropFile({ name: 'tiny.pdf', size: 1, type: 'application/pdf' })
    assertEquals(res.valid, true, '1-byte PDF should be valid')
  })

  await test('Dropzone', 'Oversized file (25MB + 1 byte) is rejected with limit error', () => {
    const res = validateDropFile({
      name: 'large_scans.pdf',
      size: 25 * 1024 * 1024 + 1,
      type: 'application/pdf'
    })
    assertEquals(res.valid, false, '25MB + 1 byte should be invalid')
    assert(Boolean(res.reason?.includes('exceeds 25 MB')), `Reason should mention 25 MB limit, got: ${res.reason}`)
  })

  await test('Dropzone', 'Extreme file (500MB) is rejected with limit error', () => {
    const res = validateDropFile({
      name: 'archive.pdf',
      size: 500 * 1024 * 1024,
      type: 'application/pdf'
    })
    assertEquals(res.valid, false, '500MB file should be invalid')
    assert(Boolean(res.reason?.includes('exceeds 25 MB')), `Reason should mention 25 MB limit, got: ${res.reason}`)
  })

  await test('Dropzone', 'Exact boundary file (25MB exactly) is accepted', () => {
    const res = validateDropFile({
      name: 'max_allowed.pdf',
      size: 25 * 1024 * 1024,
      type: 'application/pdf'
    })
    assertEquals(res.valid, true, 'Exact 25MB file should be valid')
  })

  await test('Dropzone', 'Unsupported extension .exe is rejected', () => {
    const res = validateDropFile({ name: 'malware.exe', size: 1024, type: 'application/x-msdownload' })
    assertEquals(res.valid, false, '.exe should be rejected')
    assert(Boolean(res.reason?.includes('Unsupported file type')), 'Error must mention unsupported file type')
  })

  await test('Dropzone', 'Unsupported extension .docx is rejected', () => {
    const res = validateDropFile({ name: 'notice.docx', size: 1024, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    assertEquals(res.valid, false, '.docx should be rejected')
  })

  await test('Dropzone', 'Unsupported extension .zip is rejected', () => {
    const res = validateDropFile({ name: 'all_notices.zip', size: 2048, type: 'application/zip' })
    assertEquals(res.valid, false, '.zip should be rejected')
  })

  await test('Dropzone', 'Double extension spoofing (notice.pdf.exe) is rejected', () => {
    const res = validateDropFile({ name: 'notice.pdf.exe', size: 2048, type: 'application/octet-stream' })
    assertEquals(res.valid, false, 'Double extension ending in .exe should be rejected')
  })

  await test('Dropzone', 'Uppercase extensions (.PDF, .PNG, .JPG, .JPEG) are accepted', () => {
    const files = [
      { name: 'NOTICE_1.PDF', size: 5000, type: 'application/pdf' },
      { name: 'SCAN_CHALLAN.PNG', size: 5000, type: 'image/png' },
      { name: 'INVOICE_RECEIPT.JPG', size: 5000, type: 'image/jpeg' },
      { name: 'PHOTO_AFFIDAVIT.JPEG', size: 5000, type: 'image/jpeg' },
    ]
    for (const f of files) {
      const res = validateDropFile(f)
      assertEquals(res.valid, true, `Uppercase extension for ${f.name} should be valid`)
    }
  })

  await test('Dropzone', 'Mixed-case extension (.PdF) is accepted', () => {
    const res = validateDropFile({ name: 'Official_Order.PdF', size: 5000, type: 'application/pdf' })
    assertEquals(res.valid, true, 'Mixed-case .PdF should be valid')
  })

  await test('Dropzone', 'Filename with Unicode and Hindi characters is accepted', () => {
    const res = validateDropFile({ name: 'आयकर_नोटिस_२०२६.pdf', size: 12000, type: 'application/pdf' })
    assertEquals(res.valid, true, 'Hindi filename should be valid')
  })

  await test('Dropzone', 'Batch drop of 100 mixed files correctly isolates valid vs invalid', () => {
    const batch: MockFile[] = []
    let expectedValid = 0
    let expectedInvalid = 0

    for (let i = 0; i < 100; i++) {
      if (i % 3 === 0) {
        batch.push({ name: `bad_${i}.exe`, size: 1000, type: 'application/x-msdownload' })
        expectedInvalid++
      } else if (i % 3 === 1) {
        batch.push({ name: `zero_${i}.pdf`, size: 0, type: 'application/pdf' })
        expectedInvalid++
      } else {
        batch.push({ name: `good_${i}.pdf`, size: 5000, type: 'application/pdf' })
        expectedValid++
      }
    }

    let actualValid = 0
    let actualInvalid = 0
    for (const f of batch) {
      const res = validateDropFile(f)
      if (res.valid) actualValid++
      else actualInvalid++
    }

    assertEquals(actualValid, expectedValid, 'Correct number of valid files parsed in batch')
    assertEquals(actualInvalid, expectedInvalid, 'Correct number of invalid files rejected in batch')
  })
}

// ==========================================
// 2. Sample Notice Presets Integrity Oracle
// ==========================================

async function runSampleNoticePresetTests() {
  console.log('\n--- [SUITE 2: SAMPLE NOTICE PRESETS & FIELD COMPLETENESS ORACLE] ---')

  await test('Presets', 'Exactly 3 official presets are registered', () => {
    assertEquals(SAMPLE_NOTICES.length, 3, 'Must have exactly 3 sample notices')
  })

  await test('Presets', 'GST DRC-01 preset field completeness (DIN, Authority, Form, Penalty, Deadline)', () => {
    const gst = getSampleNoticeById('gst-drc-01')
    assert(Boolean(gst), 'gst-drc-01 must exist')
    if (!gst) return

    assertEquals(gst.id, 'gst-drc-01', 'id matches')
    assert(gst.title.includes('GST DRC-01'), 'title includes GST DRC-01')
    assert(gst.authority.includes('Office of the Deputy Commissioner of State Tax'), 'authority specified')
    assert(gst.form.includes('Form GST DRC-01'), 'form specifies DRC-01')
    assertEquals(gst.dinNumber, 'DIN-2026-GST-09281-ND', 'DIN code matches exact format')
    assertEquals(gst.penaltyAmount, 237337, 'Statutory penalty exposure matches ₹2,37,337')
    assertEquals(gst.deadline, '2026-11-15', 'Deadline matches 2026-11-15')
    assert(gst.issue.length > 50, 'Issue description must be comprehensive')
    assert(gst.documents.length >= 4, 'Must request at least 4 evidentiary documents')
    assert(gst.confidence >= 0.90, 'Confidence must be >= 0.90')
    assertEquals(gst.owner_role, 'ca', 'Assigned bench is CA')
    assert(gst.sampleText.includes('DIN-2026-GST-09281-ND'), 'sampleText contains DIN')
    assert(gst.sampleText.includes('2,37,337'), 'sampleText contains quantified demand')
    assert(gst.sampleText.includes('15-11-2026'), 'sampleText contains deadline')
  })

  await test('Presets', 'Income Tax 148A preset field completeness (DIN, Authority, Form, Penalty, Deadline)', () => {
    const it = getSampleNoticeById('it-148a')
    assert(Boolean(it), 'it-148a must exist')
    if (!it) return

    assertEquals(it.id, 'it-148a', 'id matches')
    assert(it.title.includes('Income Tax 148A'), 'title includes Income Tax 148A')
    assert(it.authority.includes('Office of the Income Tax Officer, Ward 14(1)'), 'authority specified')
    assert(it.form.includes('Section 148A(b)'), 'form specifies 148A(b)')
    assertEquals(it.dinNumber, 'ITBA/AST/S/148A/2026-27/10892014', 'DIN code matches ITBA format')
    assertEquals(it.penaltyAmount, 1318500, 'Statutory penalty exposure matches ₹13,18,500')
    assertEquals(it.deadline, '2026-10-25', 'Deadline matches 2026-10-25')
    assert(it.issue.length > 50, 'Issue description must be comprehensive')
    assert(it.documents.length >= 4, 'Must request at least 4 evidentiary documents')
    assert(it.confidence >= 0.90, 'Confidence must be >= 0.90')
    assertEquals(it.owner_role, 'ca', 'Assigned bench is CA')
    assert(it.sampleText.includes('ITBA/AST/S/148A/2026-27/10892014'), 'sampleText contains DIN')
    assert(it.sampleText.includes('13,18,500'), 'sampleText contains quantified demand')
    assert(it.sampleText.includes('25-10-2026'), 'sampleText contains deadline')
  })

  await test('Presets', 'EPFO 7A preset field completeness (DIN, Authority, Form, Penalty, Deadline)', () => {
    const epfo = getSampleNoticeById('epfo-7a')
    assert(Boolean(epfo), 'epfo-7a must exist')
    if (!epfo) return

    assertEquals(epfo.id, 'epfo-7a', 'id matches')
    assert(epfo.title.includes('EPFO 7A'), 'title includes EPFO 7A')
    assert(epfo.authority.includes('Regional Provident Fund Commissioner'), 'authority specified')
    assert(epfo.form.includes('Section 7A & 14B'), 'form specifies 7A & 14B')
    assertEquals(epfo.dinNumber, 'EPFO/RO/BLR-N/7A/2026/4109', 'DIN code matches EPFO format')
    assertEquals(epfo.penaltyAmount, 427800, 'Statutory penalty exposure matches ₹4,27,800')
    assertEquals(epfo.deadline, '2026-11-05', 'Deadline matches 2026-11-05')
    assert(epfo.issue.length > 50, 'Issue description must be comprehensive')
    assert(epfo.documents.length >= 4, 'Must request at least 4 evidentiary documents')
    assert(epfo.confidence >= 0.90, 'Confidence must be >= 0.90')
    assertEquals(epfo.owner_role, 'owner', 'Assigned bench is Owner')
    assert(epfo.sampleText.includes('EPFO/RO/BLR-N/7A/2026/4109'), 'sampleText contains DIN')
    assert(epfo.sampleText.includes('4,27,800'), 'sampleText contains quantified demand')
    assert(epfo.sampleText.includes('05-11-2026'), 'sampleText contains deadline')
  })

  await test('Presets', 'Deadlines in all presets are ISO-8601 compliant YYYY-MM-DD dates', () => {
    for (const notice of SAMPLE_NOTICES) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(notice.deadline), `Deadline ${notice.deadline} must match YYYY-MM-DD`)
      const d = new Date(notice.deadline)
      assert(!isNaN(d.getTime()), `Deadline ${notice.deadline} must be valid date`)
    }
  })

  await test('Presets', 'All penalties are positive non-zero integers', () => {
    for (const notice of SAMPLE_NOTICES) {
      assert(Number.isInteger(notice.penaltyAmount), `Penalty ${notice.penaltyAmount} must be an integer`)
      assert(notice.penaltyAmount > 0, `Penalty ${notice.penaltyAmount} must be > 0`)
    }
  })

  await test('Presets', 'getSampleNoticeById returns undefined on unknown, empty, or malicious ID without throw', () => {
    assertEquals(getSampleNoticeById('unknown'), undefined, 'unknown ID returns undefined')
    assertEquals(getSampleNoticeById(''), undefined, 'empty ID returns undefined')
    assertEquals(getSampleNoticeById('__proto__'), undefined, '__proto__ returns undefined')
    assertEquals(getSampleNoticeById('../../etc/passwd'), undefined, 'path traversal returns undefined')
    assertEquals(getSampleNoticeById('<script>'), undefined, 'XSS returns undefined')
  })
}

// ==========================================
// 3. Extraction Endpoint (/api/extract-notice) Adversarial HTTP Stress Harness
// ==========================================

async function waitForServer(url: string, timeoutMs = 25000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.status > 0) return true
    } catch {
      await new Promise(r => setTimeout(r, 500))
    }
  }
  return false
}

async function runExtractionHttpTests(baseUrl: string) {
  console.log(`\n--- [SUITE 3: EXTRACTION ENDPOINT ADVERSARIAL HTTP STRESS HARNESS (${baseUrl})] ---`)

  const extractUrl = `${baseUrl}/api/extract-notice`

  await test('API HTTP', 'Empty JSON payload ({}) returns 400 or 401 without 500 crash', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    assert(res.status === 400 || res.status === 401, `Empty body should yield 400 or 401, got ${res.status}`)
    const json = await res.json()
    assert(Boolean(json.error), 'Response must contain error property')
  })

  await test('API HTTP', 'Empty raw string body ("") returns 400 or 401 without 500 crash', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    })
    assert(res.status === 400 || res.status === 401, `Empty raw body should yield 400 or 401, got ${res.status}`)
    const json = await res.json()
    assert(Boolean(json.error), 'Response must contain error property')
  })

  await test('API HTTP', 'Malformed/corrupted JSON string returns 400 or 401 without 500 crash', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ broken_json: [invalid '
    })
    assert(res.status === 400 || res.status === 401, `Corrupted JSON should yield 400 or 401, got ${res.status}`)
    const json = await res.json()
    assert(Boolean(json.error), 'Response must contain error property')
  })

  await test('API HTTP', 'Null keys payload returns 400 or 401 without 500 crash', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId: null, sampleText: null, fileUrl: null })
    })
    assert(res.status === 400 || res.status === 401, `Null values should yield 400 or 401, got ${res.status}`)
    const json = await res.json()
    assert(Boolean(json.error), 'Response must contain error property')
  })

  await test('API HTTP', 'Unknown sampleId returns 400 without 500 server crash', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId: 'non-existent-sample-preset-999' })
    })
    assert(res.status === 400 || res.status === 200, `Status must be 400 or 200 handled, got: ${res.status}`)
    const json = await res.json()
    assert(res.status === 400 ? Boolean(json.error) : Boolean(json.data), 'Expected error or fallback data')
  })

  await test('API HTTP', 'Preset quick-load GST DRC-01 returns complete statutory docket payload', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId: 'gst-drc-01' })
    })
    assertEquals(res.status, 200, 'GST DRC-01 should yield 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    const d = json.data
    assert(d.authority.toLowerCase().includes('state tax') || d.authority.toLowerCase().includes('deputy commissioner'), 'Authority indicates GST State Tax')
    assert(d.form.toLowerCase().includes('drc-01'), 'Form code contains DRC-01')
    assertEquals(d.dinNumber || d.din_number, 'DIN-2026-GST-09281-ND', 'DIN code extracted')
    assert(Number(d.penaltyAmount || d.penalty_amount) > 0, 'Penalty exposure extracted')
    assertEquals(d.deadline, '2026-11-15', 'Statutory deadline extracted')
    assert(Array.isArray(d.documents) && d.documents.length >= 4, 'Documents list present')
  })

  await test('API HTTP', 'Preset quick-load IT 148A returns complete statutory docket payload', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId: 'it-148a' })
    })
    assertEquals(res.status, 200, 'IT 148A should yield 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    const d = json.data
    assert(d.authority.toLowerCase().includes('income tax'), 'Authority indicates Income Tax')
    assert(d.form.toLowerCase().includes('148a'), 'Form code contains 148A')
    assertEquals(d.dinNumber || d.din_number, 'ITBA/AST/S/148A/2026-27/10892014', 'DIN code extracted')
    assert(Number(d.penaltyAmount || d.penalty_amount) > 0, 'Penalty exposure extracted')
    assertEquals(d.deadline, '2026-10-25', 'Statutory deadline extracted')
  })

  await test('API HTTP', 'Preset quick-load EPFO 7A returns complete statutory docket payload', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleId: 'epfo-7a' })
    })
    assertEquals(res.status, 200, 'EPFO 7A should yield 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    const d = json.data
    assert(d.authority.toLowerCase().includes('provident fund'), 'Authority indicates Provident Fund')
    assert(d.form.toLowerCase().includes('7a'), 'Form code contains 7A')
    assertEquals(d.dinNumber || d.din_number, 'EPFO/RO/BLR-N/7A/2026/4109', 'DIN code extracted')
    assert(Number(d.penaltyAmount || d.penalty_amount) > 0, 'Penalty exposure extracted')
    assertEquals(d.deadline, '2026-11-05', 'Statutory deadline extracted')
  })

  await test('API HTTP', 'sampleText keyword routing detects GST text', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: 'Special circle Division IV New Delhi GST DRC-01 demand Rs 185420' })
    })
    assertEquals(res.status, 200, 'Should return 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    assert(json.data.form.includes('DRC-01') || json.data.authority.includes('State Tax'), 'Detected GST routing')
  })

  await test('API HTTP', 'sampleText keyword routing detects Income Tax 148A text', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: 'Notice under Section 148A of Income Tax Act for AY 2023-24' })
    })
    assertEquals(res.status, 200, 'Should return 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    assert(json.data.form.includes('148A') || json.data.authority.includes('Income Tax'), 'Detected IT routing')
  })

  await test('API HTTP', 'sampleText keyword routing detects EPFO 7A text', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: 'Employees Provident Fund summons under section 7A and damages under section 14B' })
    })
    assertEquals(res.status, 200, 'Should return 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    assert(json.data.form.includes('7A') || json.data.authority.includes('Provident Fund'), 'Detected EPFO routing')
  })

  await test('API HTTP', 'sampleText unclassified text produces valid structured fallback', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: 'Municipal Corporation Mumbai trade license renewal fee demand' })
    })
    assertEquals(res.status, 200, 'Should return 200')
    const json = await res.json()
    assert(Boolean(json.data), 'Response must contain data')
    assert(Boolean(json.data.authority), 'Authority populated')
    assert(Boolean(json.data.form), 'Form populated')
    assert(Boolean(json.data.deadline), 'Deadline populated')
    assert(Array.isArray(json.data.documents), 'Documents array populated')
  })

  await test('API HTTP', 'Adversarial XSS / HTML script injection payload in sampleText handled safely', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: '<script>alert("XSS")</script><img src=x onerror=alert(1)>' })
    })
    assertEquals(res.status, 200, 'Should return 200 without executing or crashing')
    const json = await res.json()
    assert(Boolean(json.data), 'Response has structured data')
  })

  await test('API HTTP', 'Adversarial SQL injection payload in sampleText handled safely', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: "'; DROP TABLE notices; SELECT * FROM profiles WHERE '1'='1' --" })
    })
    assertEquals(res.status, 200, 'Should return 200 without crashing')
    const json = await res.json()
    assert(Boolean(json.data), 'Response has structured data')
  })

  await test('API HTTP', 'Adversarial massive payload (50,000 characters) processed without timeout or OOM', async () => {
    const huge = 'SECTION 73 DRC-01 GST NOTICE '.repeat(2000)
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: huge })
    })
    assertEquals(res.status, 200, 'Should process large string safely')
    const json = await res.json()
    assert(Boolean(json.data), 'Response has structured data')
  })

  await test('API HTTP', 'Adversarial Unicode & Hindi text processed cleanly', async () => {
    const res = await fetch(extractUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText: 'केंद्रीय माल और सेवा कर विभाग नोटिस डीआरसी-०१ नई दिल्ली' })
    })
    assertEquals(res.status, 200, 'Should handle Unicode cleanly')
    const json = await res.json()
    assert(Boolean(json.data), 'Response has structured data')
  })

  await test('API HTTP', 'Concurrent burst load (10 simultaneous requests) all resolve with zero 500 errors', async () => {
    const payloads = [
      { sampleId: 'gst-drc-01' },
      { sampleId: 'it-148a' },
      { sampleId: 'epfo-7a' },
      { sampleText: 'GST DRC-01 mismatch' },
      { sampleText: 'IT 148A cash deposit' },
      { sampleText: 'EPFO 7A arrears' },
      { sampleId: 'gst-drc-01' },
      { sampleId: 'it-148a' },
      { sampleId: 'epfo-7a' },
      { sampleText: 'Unclassified notice' }
    ]

    const responses = await Promise.all(
      payloads.map(p =>
        fetch(extractUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        })
      )
    )

    for (const r of responses) {
      assert(r.status === 200, `Expected 200 in burst test, got: ${r.status}`)
    }
  })
}

// ==========================================
// Main Runner
// ==========================================

async function main() {
  console.log('=================================================================')
  console.log('   VYAPAARSATHI MILESTONE 1 ADVERSARIAL CHALLENGE RUNNER')
  console.log('=================================================================')

  // Run in-process tests first
  await runDropzoneValidationTests()
  await runSampleNoticePresetTests()

  // Run HTTP tests with Next.js production server
  const PORT = 3009
  const baseUrl = `http://127.0.0.1:${PORT}`
  console.log(`\n[Challenger 1] Launching Next.js production server on port ${PORT}...`)

  let serverProcess: ChildProcess | null = null

  try {
    serverProcess = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['next', 'start', '-p', String(PORT)],
      {
        stdio: 'pipe',
        cwd: process.cwd(),
        shell: process.platform === 'win32',
        env: { ...process.env, PORT: String(PORT) }
      }
    )

    serverProcess.stderr?.on('data', (d) => {
      const errStr = d.toString()
      if (!errStr.includes('ExperimentalWarning') && !errStr.includes('warn')) {
        // console.error('[Next.js Server Stderr]:', errStr)
      }
    })

    const ready = await waitForServer(baseUrl)
    if (!ready) {
      throw new Error(`Next.js production server failed to become responsive on ${baseUrl} within 25s`)
    }
    console.log(`[Challenger 1] Server active on ${baseUrl}. Running HTTP adversarial tests...`)

    await runExtractionHttpTests(baseUrl)

  } finally {
    if (serverProcess) {
      console.log('\n[Challenger 1] Terminating test server process...')
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'])
      } else {
        serverProcess.kill('SIGTERM')
      }
    }
  }

  // Print Summary
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log('\n=================================================================')
  console.log(`   ADVERSARIAL CHALLENGE SUMMARY: ${passed}/${results.length} PASSED (${failed} FAILED)`)
  console.log('=================================================================')

  if (failed > 0) {
    console.error('\nFAILED TESTS:')
    for (const r of results.filter(r => !r.passed)) {
      console.error(`- [${r.suite}] ${r.name}: ${r.error}`)
    }
    process.exit(1)
  } else {
    console.log('\n[Challenger 1] All Milestone 1 adversarial tests PASSED with zero failures.')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('[Challenger 1] Fatal error in test runner:', err)
  process.exit(1)
})
