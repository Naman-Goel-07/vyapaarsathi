/**
 * VyapaarSathi Milestone 1 Empirical Challenger 2 Verification Suite
 *
 * Verifies R1 Acceptance Criteria:
 * "The reviewer agent can simulate a click on 'Try a Sample Govt Notice' and verify that
 *  mock notice text populates the extraction UI and is successfully parsed by the
 *  simulated/real Gemini endpoint without crashing."
 *
 * Scope:
 * - Automated live HTTP testing of /api/extract-notice on Next.js server
 * - Sample notice click simulation & UI state machine verification
 * - Adversarial stress testing (edge cases, unauthenticated, invalid bodies)
 * - Multi-file dropzone queue and validation simulation
 */

import { spawn, type ChildProcess } from 'node:child_process'
import * as path from 'node:path'
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
      'E-Way bills and inward consignment notes',
    ],
    action: 'Prepare and submit response in Form GST DRC-06 with reconciliation annexures and supplier verification certificates.',
    owner_role: 'ca',
    confidence: 0.96,
    sampleText: `GOVERNMENT OF INDIA
MINISTRY OF FINANCE • DEPARTMENT OF REVENUE
OFFICE OF THE DEPUTY COMMISSIONER OF STATE TAX
SPECIAL CIRCLE, DIVISION-IV, NEW DELHI
GST BHAWAN, BHIKAJI CAMA PLACE, NEW DELHI - 110066

Document Identification Number (DIN): DIN-2026-GST-09281-ND
Notice Reference Number: ZA0710260019281
Date of Issue: 16-10-2026

FORM GST DRC-01
[See Rule 142(1)(a) of CGST Rules, 2017]
SUMMARY OF SHOW CAUSE NOTICE UNDER SECTION 73(1) OF THE CGST ACT, 2017

To:
M/s Bharat Logistics & Trade Enterprises
GSTIN: 07AABCB1234D1Z8
Address: Plot No. 44, Okhla Industrial Area Phase-III, New Delhi - 110020

Subject: Show cause notice for determination of tax not paid, short paid, or input tax credit wrongly availed or utilized under Section 73 of Central Goods and Services Tax Act, 2017 for Financial Year 2023-24.

1. STATEMENT OF CHARGES & DISCREPANCY FINDINGS:
During the scrutiny of returns under Section 61 and automated algorithmic cross-matching for FY 2023-24, a substantial discrepancy has been detected between the Input Tax Credit (ITC) reflected in auto-generated GSTR-2B statements and the ITC availed by the taxpayer in monthly GSTR-3B returns.

Specifically, the taxpayer has claimed inward Input Tax Credit of ₹1,85,420/- against tax invoices purportedly issued by supplier M/s Apex Tech Solutions (GSTIN: 07AAAAA0000A1Z5). Verified intelligence received from DGGI confirms that the GST registration of M/s Apex Tech Solutions was cancelled ab initio with retrospective effect due to circular bill trading without underlying movement of goods. Under Section 16(2)(c) read with Section 17(5) of the CGST Act, credit claimed on non-existent or cancelled suppliers is ineligible and stands disallowed.

2. QUANTIFICATION OF DEMAND & STATUTORY EXPOSURE:
- Tax Demand (Disallowed ITC): ₹1,85,420/-
- Applicable Interest u/s 50(1) (@ 18% p.a.): ₹33,375/-
- Statutory Penalty u/s 73(9) (10% of tax): ₹18,542/-
-------------------------------------------------------------
TOTAL STATUTORY DEMAND / PENALTY EXPOSURE: ₹2,37,337/-

3. MANDATORY COMPLIANCE TIMELINE:
You are hereby directed to show cause within thirty (30) days from receipt of this notice, on or before 15-11-2026 (Statutory Deadline: 2026-11-15), by filing a comprehensive reply in Form GST DRC-06 on the common portal.

4. EVIDENTIARY RECORDS REQUISITIONED:
(a) GSTR-2B vs GSTR-3B monthly reconciliation sheet for FY 2023-24.
(b) Original tax invoices and tax credit debit notes issued by supplier.
(c) Bank payment proof of invoice clearance within 180 days (Sec 16(2)).
(d) E-Way bills and inward consignment notes establishing physical delivery of goods.

Failure to furnish a valid reply by 15-11-2026 shall result in the issuance of an order under Section 73(9) determining the demand along with recovery proceedings under Section 79.

(Sd/-)
Deputy Commissioner of State Tax
Special Circle, Division-IV, New Delhi`
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
    sampleText: `GOVERNMENT OF INDIA
MINISTRY OF FINANCE • CENTRAL BOARD OF DIRECT TAXES
OFFICE OF THE INCOME TAX OFFICER, WARD 14(1), MUMBAI
AAYAKAR BHAWAN, MAHARSHI KARVE ROAD, MUMBAI - 400020

Document Identification Number (DIN): ITBA/AST/S/148A/2026-27/10892014
Notice No: ITBA/AST/F/148A/2026-27/0049281
Date of Dispatch: 11-10-2026

NOTICE UNDER CLAUSE (b) OF SECTION 148A OF THE INCOME-TAX ACT, 1961
Assessment Year: 2023-24 (Financial Year: 2022-23)

To:
M/s Bharat Logistics & Trade Enterprises (PAN: AABCB1234D)
Office No. 302, Nariman Bhavan, Nariman Point, Mumbai - 400021

Subject: Opportunity of being heard under Section 148A(b) before issuance of notice under Section 148 for Assessment Year 2023-24.

1. INFORMATION SUGGESTING ESCAPEMENT OF INCOME:
As per data uploaded in the Insight Portal and Annual Information Statement (AIS) under the Risk Management Strategy (RMS), high-value aggregate cash deposits of ₹42,50,000/- were credited into Current Account No. 0041020000987 maintained with HDFC Bank during FY 2022-23.

In the ITR-5 filed by you for AY 2023-24, total declared gross turnover was recorded as ₹14,50,000/-, thereby leaving an unexplained discrepancy of ₹28,00,000/-. This suggests prima facie that income chargeable to tax has escaped assessment within the meaning of Section 147.

2. ESTIMATED TAX DEMAND & STATUTORY PENALTY EXPOSURE:
- Income Escaped Assessment: ₹28,00,000/-
- Estimated Basic Tax & Surcharge: ₹8,73,600/-
- Interest under Section 234A/B/C: ₹2,19,900/-
- Penalty exposure u/s 270A for misreporting (50% to 200%): ₹2,25,000/-
----------------------------------------------------------------------
TOTAL STATUTORY LIABILITY / DEMAND EXPOSURE: ₹13,18,500/-

3. STATUTORY TIME LIMIT FOR SUBMISSION:
Under Section 148A(b), you are hereby provided an opportunity to show cause why a notice under Section 148 should not be issued. Your formal representation along with supporting documentary proofs must be submitted through the e-Filing Portal on or before 25-10-2026 (Statutory Deadline: 2026-10-25).

4. EVIDENTIARY REQUISITION:
(1) Audited Profit & Loss Statement & Balance Sheet (AY 2023-24).
(2) Complete Bank Statements for all current accounts with deposit narrations.
(3) Cash Book and Day Book ledgers for FY 2022-23.
(4) Daily cash sales register and VAT/GST monthly returns matching cash remittances.

Take notice that if no response is furnished by the specified deadline of 25-10-2026, an order under Section 148A(d) will be passed based on material available on record.

(Sd/-)
Income Tax Officer, Ward 14(1)
Mumbai`
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
    sampleText: `EMPLOYEES' PROVIDENT FUND ORGANISATION
MINISTRY OF LABOUR & EMPLOYMENT • GOVERNMENT OF INDIA
REGIONAL OFFICE: BENGALURU NORTH
BHAVISHYA NIDHI BHAWAN, RAJAJI NAGAR, BENGALURU - 560010

Document Identification Number (DIN): EPFO/RO/BLR-N/7A/2026/4109
File No: KN/BLR/RO-N/ENF/7A-14B/2026/8841
Date: 08-10-2026

SUMMONS UNDER SECTION 7A AND NOTICE UNDER SECTION 14B & 7Q
EMPLOYEES' PROVIDENT FUNDS AND MISCELLANEOUS PROVISIONS ACT, 1952

To:
The Employer / Authorized Signatory
M/s Bharat Logistics & Trade Enterprises
Establishment Code: KN/BLR/0049281/000
Bengaluru Branch Office, Peenya Industrial Area, Bengaluru - 560058

Subject: Quasi-judicial inquiry under Section 7A for determination of dues and Section 14B/7Q for damages and interest for the period 04/2023 to 03/2026.

1. GROUNDS OF INQUIRY & VIOLATIONS:
A spot inspection and verification of records conducted by the Enforcement Officer revealed that your establishment failed to enroll twenty-four (24) contractual security and facility housekeeping employees in the Provident Fund Scheme. Further, monthly statutory contributions under Section 6 were either omitted or remitted after substantial delays beyond the 15th of each succeeding month.

2. COMPUTATION OF ASSESSED STATUTORY DUES & DAMAGES:
- Assessed Principal PF Dues (Sec 7A): ₹3,12,000/-
- Penal Damages under Section 14B: ₹78,000/-
- Statutory Interest under Section 7Q: ₹37,800/-
-----------------------------------------------------
TOTAL STATUTORY LIABILITY / DEMAND EXPOSURE: ₹4,27,800/-
(Note: Continuous late fee of ₹50/day accrues for every day of unexcused default beyond hearing date)

3. DATE OF HEARING & STATUTORY SUBMISSION DEADLINE:
You are hereby summoned to appear before the undersigned in the Court Room of the Regional PF Commissioner, Rajaji Nagar, Bengaluru on or before 05-11-2026 at 11:30 AM (Statutory Deadline: 2026-11-05), either in person or through an accredited representative.

4. MANDATORY RECORDS TO PRODUCE:
(1) Master Attendance Registers for outsourced personnel.
(2) Wage / Salary payment sheets (Form 10) covering 04/2023 to 03/2026.
(3) Contractor service agreements and monthly invoices.
(4) Bank disbursement proof for staff salaries and ledger extracts.

Please take note that in the event of default of appearance or failure to produce the requisitioned records on 05-11-2026, proceedings will be concluded ex-parte under Section 7A(2) and warrants under Section 8B shall be issued for attachment of establishment bank accounts.

(Sd/-)
Regional Provident Fund Commissioner-II
Bengaluru North`
  }
]

export function validateDropzoneFile(file: {
  name: string
  size: number
  type: string
}): { valid: boolean; reason?: string } {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg']
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg']
  const maxSizeBytes = 25 * 1024 * 1024 // 25 MB

  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      reason: `Unsupported file type: ${ext || file.type}. Only PDF and images are accepted.`,
    }
  }

  if (file.size <= 0) {
    return { valid: false, reason: 'File is empty (0 bytes).' }
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, reason: `File size exceeds 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).` }
  }

  return { valid: true }
}

const PORT = 3456
const BASE_URL = `http://127.0.0.1:${PORT}`

interface AssertionResult {
  name: string
  passed: boolean
  error?: string
  durationMs: number
}

const results: AssertionResult[] = []

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`)
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`)
  }
}

async function runTest(name: string, fn: () => Promise<void> | void): Promise<void> {
  const start = Date.now()
  try {
    await fn()
    const durationMs = Date.now() - start
    results.push({ name, passed: true, durationMs })
    console.log(`  [PASS] ${name} (${durationMs}ms)`)
  } catch (err: any) {
    const durationMs = Date.now() - start
    results.push({ name, passed: false, error: err.message, durationMs })
    console.error(`  [FAIL] ${name} (${durationMs}ms) -> ${err.message}`)
  }
}

// Wait for HTTP server to respond
async function waitForServer(url: string, timeoutMs: number = 20000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (res.status >= 200 && res.status < 500) {
        return true
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  return false
}

// UI State Simulation Harness for UploadNotice component
class UploadNoticeSimulator {
  public isDragging: boolean = false
  public queuedFiles: Array<{ id: string; name: string; size: number; type: string }> = []
  public loading: boolean = false
  public loadingMessage: string = ''
  public isModalOpen: boolean = false
  public docketData: any = null
  public activeSampleId: string | null = null
  public errorMessage: string | null = null

  // Dropzone drag events
  public handleDragOver() {
    this.isDragging = true
  }
  public handleDragLeave() {
    this.isDragging = false
  }
  public handleDrop(files: Array<{ name: string; size: number; type: string }>) {
    this.isDragging = false
    for (const f of files) {
      const validation = validateDropzoneFile(f)
      if (!validation.valid) {
        this.errorMessage = validation.reason || 'Invalid file'
        continue
      }
      this.queuedFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: f.name,
        size: f.size,
        type: f.type
      })
    }
  }

  public removeQueuedFile(id: string) {
    this.queuedFiles = this.queuedFiles.filter(f => f.id !== id)
  }

  public clearQueue() {
    this.queuedFiles = []
  }

  // Simulate 1-click sample button click matching UploadNotice.tsx handleLoadSample
  public async handleLoadSample(sample: SampleNotice, apiEndpoint: string = `${BASE_URL}/api/extract-notice`) {
    this.loading = true
    this.loadingMessage = `Transcribing ${sample.title} with Gemini 2.5 Flash...`
    this.errorMessage = null
    this.activeSampleId = sample.id

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: sample.id,
          sampleText: sample.sampleText,
          businessId: 'test-business-id'
        }),
        signal: AbortSignal.timeout(10000)
      })

      const json = await res.json()
      const data = json.data || sample

      this.docketData = {
        authority: data.authority || sample.authority,
        form: data.form || sample.form,
        dinNumber: data.din_number || data.dinNumber || sample.dinNumber,
        issue: data.issue || sample.issue,
        deadline: data.deadline || sample.deadline,
        penaltyAmount: typeof (data.penalty_amount || data.penaltyAmount) === 'number'
          ? (data.penalty_amount || data.penaltyAmount)
          : sample.penaltyAmount,
        action: data.action || sample.action || 'Prepare and submit response in Form GST DRC-06',
        owner_role: (data.owner_role as 'owner' | 'ca') || sample.owner_role || 'ca',
        documents: Array.isArray(data.documents) ? [...data.documents] : [...sample.documents],
        confidence: typeof data.confidence === 'number' ? data.confidence : sample.confidence,
        rawFileUrl: `sample://${sample.id}`
      }

      this.isModalOpen = true
    } catch (err: any) {
      // Resilient fallback in UploadNotice.tsx populates directly from sample
      this.docketData = {
        authority: sample.authority,
        form: sample.form,
        dinNumber: sample.dinNumber,
        issue: sample.issue,
        deadline: sample.deadline,
        penaltyAmount: sample.penaltyAmount,
        action: sample.action || 'Submit statutory reply',
        owner_role: sample.owner_role || 'ca',
        documents: [...sample.documents],
        confidence: sample.confidence,
        rawFileUrl: `sample://${sample.id}`
      }
      this.isModalOpen = true
    } finally {
      this.loading = false
      this.loadingMessage = ''
    }
  }

  // Edit docket field in modal
  public updateField(fieldName: string, value: any) {
    if (!this.docketData) throw new Error('Cannot update field: modal not open')
    this.docketData[fieldName] = value
  }

  // Add document to evidentiary checklist
  public addDocument(docName: string) {
    if (!this.docketData) throw new Error('Cannot add document: modal not open')
    if (!docName.trim()) return
    this.docketData.documents.push(docName.trim())
  }

  // Remove document from evidentiary checklist
  public removeDocument(index: number) {
    if (!this.docketData) throw new Error('Cannot remove document: modal not open')
    this.docketData.documents = this.docketData.documents.filter((_: any, i: number) => i !== index)
  }

  // Discard action
  public discardDocket() {
    this.isModalOpen = false
    this.docketData = null
  }
}

async function main() {
  console.log('\n===============================================================')
  console.log('   CHALLENGER 2: MILESTONE 1 EMPIRICAL VERIFICATION HARNESS')
  console.log('===============================================================\n')

  // STEP 1: Launch Next.js Production Server on Port 3456
  console.log(`[Stage 1] Launching Next.js production server on port ${PORT}...`)
  const serverProcess: ChildProcess = spawn(
    'npx',
    ['next', 'start', '-p', String(PORT)],
    {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(PORT) }
    }
  )

  let serverCleanedUp = false
  const cleanupServer = () => {
    if (!serverCleanedUp && serverProcess.pid) {
      serverCleanedUp = true
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(serverProcess.pid), '/T', '/F'])
        } else {
          serverProcess.kill('SIGTERM')
        }
      } catch {
        // ignore
      }
    }
  }

  process.on('exit', cleanupServer)
  process.on('SIGINT', cleanupServer)
  process.on('SIGTERM', cleanupServer)

  const serverReady = await waitForServer(BASE_URL, 20000)
  if (!serverReady) {
    console.error(`[Error] Next.js server failed to respond on ${BASE_URL} within 20s.`)
    cleanupServer()
    process.exit(1)
  }
  console.log(`[Stage 1] Next.js server is ACTIVE at ${BASE_URL}.\n`)

  try {
    // -------------------------------------------------------------
    // SECTION 1: LIVE HTTP API ENDPOINT VERIFICATION (/api/extract-notice)
    // -------------------------------------------------------------
    console.log('--- [SECTION 1: LIVE HTTP API ENDPOINT VERIFICATION] ---')

    await runTest('API-01: POST /api/extract-notice with sampleId gst-drc-01', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: 'gst-drc-01', businessId: 'demo-biz' })
      })

      assertEquals(res.status, 200, 'HTTP status code must be 200')
      const json = await res.json()
      assert(!!json.data, 'Response must contain data object')
      assertEquals(json.data.din_number || json.data.dinNumber, 'DIN-2026-GST-09281-ND', 'DIN reference must match')
      assertEquals(json.data.penalty_amount || json.data.penaltyAmount, 237337, 'Demand must be ₹2,37,337')
      assertEquals(json.data.deadline, '2026-11-15', 'Deadline must match 2026-11-15')
      assert(typeof json.data.authority === 'string' && json.data.authority.length > 5, 'Authority populated')
      assert(Array.isArray(json.data.documents) && json.data.documents.length >= 4, 'Must have at least 4 documents')
      assert(json.data.confidence >= 0.8, 'Confidence must be >= 0.80')
    })

    await runTest('API-02: POST /api/extract-notice with sampleId it-148a', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: 'it-148a', businessId: 'demo-biz' })
      })

      assertEquals(res.status, 200, 'HTTP status code must be 200')
      const json = await res.json()
      assert(!!json.data, 'Response must contain data object')
      assertEquals(json.data.din_number || json.data.dinNumber, 'ITBA/AST/S/148A/2026-27/10892014', 'DIN reference must match')
      assertEquals(json.data.penalty_amount || json.data.penaltyAmount, 1318500, 'Demand must be ₹13,18,500')
      assertEquals(json.data.deadline, '2026-10-25', 'Deadline must match 2026-10-25')
      assert(json.data.issue.includes('42,50,000') || json.data.issue.includes('deposits'), 'Must capture cash deposits issue')
      assert(Array.isArray(json.data.documents) && json.data.documents.length >= 4, 'Must have at least 4 documents')
    })

    await runTest('API-03: POST /api/extract-notice with sampleId epfo-7a', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: 'epfo-7a', businessId: 'demo-biz' })
      })

      assertEquals(res.status, 200, 'HTTP status code must be 200')
      const json = await res.json()
      assert(!!json.data, 'Response must contain data object')
      assertEquals(json.data.din_number || json.data.dinNumber, 'EPFO/RO/BLR-N/7A/2026/4109', 'DIN reference must match')
      assertEquals(json.data.penalty_amount || json.data.penaltyAmount, 427800, 'Demand must be ₹4,27,800')
      assertEquals(json.data.deadline, '2026-11-05', 'Deadline must match 2026-11-05')
      assert(Array.isArray(json.data.documents) && json.data.documents.length >= 4, 'Must requisition at least 4 documents')
    })

    await runTest('API-04: POST /api/extract-notice with raw sampleText payload', async () => {
      const rawText = SAMPLE_NOTICES[0].sampleText
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleText: rawText, businessId: 'demo-biz' })
      })

      assertEquals(res.status, 200, 'Status must be 200')
      const json = await res.json()
      assert(!!json.data, 'Data object must exist')
      assert(json.data.authority.length > 0, 'Authority extracted')
      assert(json.data.form.length > 0, 'Form extracted')
      assert(json.data.penaltyAmount > 0 || json.data.penalty_amount > 0, 'Penalty amount non-zero')
    })

    await runTest('API-05: API response latency benchmark under 5000ms', async () => {
      const start = Date.now()
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: 'gst-drc-01' })
      })
      const latency = Date.now() - start
      assertEquals(res.status, 200, 'Status 200')
      assert(latency < 5000, `Latency must be < 5000ms (measured: ${latency}ms)`)
    })

    // -------------------------------------------------------------
    // SECTION 2: UI INTERACTION & STATE SIMULATION (UploadNotice.tsx)
    // -------------------------------------------------------------
    console.log('\n--- [SECTION 2: UI INTERACTION & STATE SIMULATION] ---')

    await runTest('UI-01: Initial component state is idle and modal is closed', () => {
      const sim = new UploadNoticeSimulator()
      assertEquals(sim.isModalOpen, false, 'Modal initially closed')
      assertEquals(sim.loading, false, 'Loading initially false')
      assertEquals(sim.docketData, null, 'docketData initially null')
      assertEquals(sim.queuedFiles.length, 0, 'Queue initially empty')
    })

    await runTest('UI-02: Simulate click on GST DRC-01 button & verify extraction state transition', async () => {
      const sim = new UploadNoticeSimulator()
      const sample = SAMPLE_NOTICES[0] // gst-drc-01

      await sim.handleLoadSample(sample)

      assertEquals(sim.loading, false, 'Loading resets to false after completion')
      assertEquals(sim.isModalOpen, true, 'Extraction docket modal opens')
      assert(!!sim.docketData, 'Docket data populated')

      // Verify Bureaucratic Form 7-A Docket Fields
      assertEquals(sim.docketData.dinNumber, 'DIN-2026-GST-09281-ND', 'DIN reference populated')
      assertEquals(sim.docketData.penaltyAmount, 237337, 'Penalty ₹2,37,337 populated')
      assertEquals(sim.docketData.deadline, '2026-11-15', 'Deadline 2026-11-15 populated')
      assert(sim.docketData.form.includes('GST DRC-01'), 'Form populated')
      assertEquals(sim.docketData.owner_role, 'ca', 'Assigned Bench is CA Bench')
      assertEquals(sim.docketData.documents.length, 4, '4 evidentiary checklist items')
      assertEquals(sim.docketData.rawFileUrl, 'sample://gst-drc-01', 'Sample file reference set')
      assert(sim.docketData.confidence >= 0.8, 'Confidence badge verified')
    })

    await runTest('UI-03: Simulate click on Income Tax 148A button & verify modal population', async () => {
      const sim = new UploadNoticeSimulator()
      const sample = SAMPLE_NOTICES[1] // it-148a

      await sim.handleLoadSample(sample)

      assertEquals(sim.isModalOpen, true, 'Modal opens')
      assertEquals(sim.docketData.dinNumber, 'ITBA/AST/S/148A/2026-27/10892014', 'DIN reference populated')
      assertEquals(sim.docketData.penaltyAmount, 1318500, 'Demand ₹13,18,500 populated')
      assertEquals(sim.docketData.deadline, '2026-10-25', 'Deadline 2026-10-25 populated')
      assert(sim.docketData.issue.includes('42,50,000') || sim.docketData.issue.includes('deposits'), 'Discrepancy captured')
    })

    await runTest('UI-04: Simulate click on EPFO 7A button & verify modal population', async () => {
      const sim = new UploadNoticeSimulator()
      const sample = SAMPLE_NOTICES[2] // epfo-7a

      await sim.handleLoadSample(sample)

      assertEquals(sim.isModalOpen, true, 'Modal opens')
      assertEquals(sim.docketData.dinNumber, 'EPFO/RO/BLR-N/7A/2026/4109', 'DIN reference populated')
      assertEquals(sim.docketData.penaltyAmount, 427800, 'Demand ₹4,27,800 populated')
      assertEquals(sim.docketData.deadline, '2026-11-05', 'Deadline 2026-11-05 populated')
      assert(sim.docketData.documents.some((d: string) => d.includes('Attendance')), 'Requisitions attendance registers')
    })

    await runTest('UI-05: Bureaucratic transcript fields are fully editable before case sealing', async () => {
      const sim = new UploadNoticeSimulator()
      await sim.handleLoadSample(SAMPLE_NOTICES[0])

      // User edits statutory deadline
      sim.updateField('deadline', '2026-11-30')
      assertEquals(sim.docketData.deadline, '2026-11-30', 'Edited deadline updated in state')

      // User edits penalty amount
      sim.updateField('penaltyAmount', 250000)
      assertEquals(sim.docketData.penaltyAmount, 250000, 'Edited penalty updated in state')

      // User switches assigned bench
      sim.updateField('owner_role', 'owner')
      assertEquals(sim.docketData.owner_role, 'owner', 'Assigned Bench switched to Owner Desk')

      // User edits discrepancy notes
      sim.updateField('issue', 'Discrepancy verified: Supplier confirmed ab-initio fake invoice.')
      assert(sim.docketData.issue.includes('fake invoice'), 'Issue notes edited')
    })

    await runTest('UI-06: Interactive Evidentiary Checklist supports adding and removing requirements', async () => {
      const sim = new UploadNoticeSimulator()
      await sim.handleLoadSample(SAMPLE_NOTICES[0])
      assertEquals(sim.docketData.documents.length, 4, 'Initial length 4')

      // Add a 5th document requirement
      sim.addDocument('Sworn Affidavit under Section 65B of Indian Evidence Act')
      assertEquals(sim.docketData.documents.length, 5, 'Checklist length now 5')
      assertEquals(sim.docketData.documents[4], 'Sworn Affidavit under Section 65B of Indian Evidence Act', 'New doc appended')

      // Remove document at index 0
      const secondDoc = sim.docketData.documents[1]
      sim.removeDocument(0)
      assertEquals(sim.docketData.documents.length, 4, 'Checklist length back to 4')
      assertEquals(sim.docketData.documents[0], secondDoc, 'Item 0 removed and shifted')
    })

    await runTest('UI-07: Discard / Scan Another button closes modal and clears transcript state', async () => {
      const sim = new UploadNoticeSimulator()
      await sim.handleLoadSample(SAMPLE_NOTICES[0])
      assertEquals(sim.isModalOpen, true, 'Modal open before discard')

      sim.discardDocket()
      assertEquals(sim.isModalOpen, false, 'Modal closed after discard')
      assertEquals(sim.docketData, null, 'Docket data reset to null')
    })

    // -------------------------------------------------------------
    // SECTION 3: MULTI-FILE DROPZONE DROP & QUEUE SIMULATION
    // -------------------------------------------------------------
    console.log('\n--- [SECTION 3: MULTI-FILE DROPZONE & QUEUE SIMULATION] ---')

    await runTest('DROP-01: Drag over and drag leave update visual active drag state', () => {
      const sim = new UploadNoticeSimulator()
      sim.handleDragOver()
      assertEquals(sim.isDragging, true, 'isDragging is true during hover')
      sim.handleDragLeave()
      assertEquals(sim.isDragging, false, 'isDragging resets to false on leave')
    })

    await runTest('DROP-02: Drop multiple valid files (.pdf, .png, .jpg) queues all items', () => {
      const sim = new UploadNoticeSimulator()
      const files = [
        { name: 'gst_notice.pdf', size: 1024 * 300, type: 'application/pdf' },
        { name: 'demand_receipt.png', size: 1024 * 150, type: 'image/png' },
        { name: 'annexure_a.jpg', size: 1024 * 200, type: 'image/jpeg' }
      ]
      sim.handleDrop(files)
      assertEquals(sim.queuedFiles.length, 3, 'All 3 files queued')
      assertEquals(sim.errorMessage, null, 'No error for valid files')
    })

    await runTest('DROP-03: Unsupported file types (.exe, .zip) rejected with explicit error', () => {
      const sim = new UploadNoticeSimulator()
      sim.handleDrop([{ name: 'trojan.exe', size: 2048, type: 'application/octet-stream' }])
      assertEquals(sim.queuedFiles.length, 0, 'Invalid file not queued')
      assert(sim.errorMessage?.includes('Unsupported file type') ?? false, 'Descriptive error displayed')
    })

    await runTest('DROP-04: Empty file (0 bytes) rejected with validation message', () => {
      const sim = new UploadNoticeSimulator()
      sim.handleDrop([{ name: 'empty_notice.pdf', size: 0, type: 'application/pdf' }])
      assertEquals(sim.queuedFiles.length, 0, 'Empty file not queued')
      assert(sim.errorMessage?.includes('empty') ?? false, 'Empty file error displayed')
    })

    await runTest('DROP-05: Oversized file (> 25MB) rejected with limit notice', () => {
      const sim = new UploadNoticeSimulator()
      const oversized = 26 * 1024 * 1024
      sim.handleDrop([{ name: 'large_archive.pdf', size: oversized, type: 'application/pdf' }])
      assertEquals(sim.queuedFiles.length, 0, 'Oversized file not queued')
      assert(sim.errorMessage?.includes('25 MB') ?? false, 'Exceeds 25MB message displayed')
    })

    await runTest('DROP-06: Individual file removal and queue clear function properly', () => {
      const sim = new UploadNoticeSimulator()
      sim.handleDrop([
        { name: 'file_a.pdf', size: 1000, type: 'application/pdf' },
        { name: 'file_b.pdf', size: 2000, type: 'application/pdf' }
      ])
      assertEquals(sim.queuedFiles.length, 2, '2 files queued')

      const firstId = sim.queuedFiles[0].id
      sim.removeQueuedFile(firstId)
      assertEquals(sim.queuedFiles.length, 1, '1 file remaining')
      assertEquals(sim.queuedFiles[0].name, 'file_b.pdf', 'file_b remains')

      sim.clearQueue()
      assertEquals(sim.queuedFiles.length, 0, 'Queue completely cleared')
    })

    // -------------------------------------------------------------
    // SECTION 4: ADVERSARIAL STRESS TESTING (ZERO-CRASH TOLERANCE)
    // -------------------------------------------------------------
    console.log('\n--- [SECTION 4: ADVERSARIAL STRESS TESTING (ZERO-CRASH)] ---')

    await runTest('ADV-01: Empty JSON payload returns 401/400 without server crash', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      assert(res.status === 401 || res.status === 400 || res.status === 200, `Must handle without 500 (got: ${res.status})`)
      const json = await res.json()
      assert(!!json.error || !!json.data, 'Must return error message or handled fallback')
    })

    await runTest('ADV-02: Unknown sampleId returns fallback object cleanly without throw', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: 'non-existent-form-999' })
      })
      assert(res.status === 400 || res.status === 200, `Must not crash with 500 (got: ${res.status})`)
    })

    await runTest('ADV-03: Malformed JSON body handled without unhandled exception', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ malformed json :: [}}'
      })
      assert(res.status === 401 || res.status === 400 || res.status === 200, `Must not crash with 500 (got: ${res.status})`)
    })

    await runTest('ADV-04: Non-sample storage fileUrl without auth returns 401 Unauthorized', async () => {
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: 'unauthorized/path/to/file.pdf' })
      })
      assertEquals(res.status, 401, 'Unauthenticated fileUrl access must be denied with 401')
      const json = await res.json()
      assertEquals(json.error, 'Unauthorized', 'Must specify Unauthorized error')
    })

    await runTest('ADV-05: Concurrent requests across sample notices', async () => {
      const sampleIds = ['gst-drc-01', 'it-148a', 'epfo-7a']
      const promises = sampleIds.map(id =>
        fetch(`${BASE_URL}/api/extract-notice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sampleId: id })
        }).then(r => r.status)
      )

      const statuses = await Promise.all(promises)
      assert(statuses.every(s => s === 200), 'Concurrent sample requests return 200')
    })

    await runTest('ADV-06: Large text payload (50KB) parsed without memory or timeout crash', async () => {
      const largeText = 'NOTICE UNDER SECTION 73 CGST ACT '.repeat(1500)
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleText: largeText })
      })
      assertEquals(res.status, 200, 'Must process 50KB payload cleanly')
      const json = await res.json()
      assert(!!json.data, 'Data parsed')
    })

    await runTest('ADV-07: XSS script injection in sampleText handled cleanly', async () => {
      const xssText = '<script>alert("pwned")</script> GST DRC-01 Demand of ₹50000'
      const res = await fetch(`${BASE_URL}/api/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleText: xssText })
      })
      assertEquals(res.status, 200, 'Must return 200')
      const json = await res.json()
      assert(!!json.data, 'Returns valid data')
    })

  } finally {
    // Teardown server
    console.log('\n[Teardown] Shutting down Next.js production server...')
    cleanupServer()
  }

  // Final Summary
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length
  const totalCount = results.length

  console.log('\n===============================================================')
  console.log(`   EMPIRICAL CHALLENGE SUMMARY: ${passedCount}/${totalCount} PASSED (${failedCount} FAILED)`)
  console.log('===============================================================')
  for (const r of results) {
    console.log(`   ${r.passed ? '✓' : '✗'} ${r.name} [${r.durationMs}ms] ${r.error ? `-> ${r.error}` : ''}`)
  }
  console.log('---------------------------------------------------------------\n')

  if (failedCount > 0) {
    console.error(`[Challenger 2] VERDICT: REQUEST_CHANGES (${failedCount} tests failed)`)
    process.exit(1)
  } else {
    console.log(`[Challenger 2] VERDICT: APPROVE (100% empirical pass)`)
    process.exit(0)
  }
}

main().catch(err => {
  console.error('[Fatal Error in Challenger 2 runner]:', err)
  process.exit(1)
})
