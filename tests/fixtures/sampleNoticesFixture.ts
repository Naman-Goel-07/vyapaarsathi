/**
 * VyapaarSathi E2E Test Fixtures
 * Derived directly from ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md
 */

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
}

export interface Task {
  id: string
  notice_id: string
  action: string
  owner_role: 'owner' | 'ca'
  status: 'pending' | 'completed'
  documents_requested?: string[]
  created_at: string
}

export interface AuditBlock {
  index: number
  timestamp: string
  actor: 'Owner' | 'CA' | 'System'
  action: string
  prevHash: string
  hash: string
  payload: Record<string, unknown>
}

export const SAMPLE_NOTICES: Record<string, SampleNotice> = {
  'gst-drc-01': {
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
    sampleText: `FORM GST DRC-01
[See Rule 142(1)]
Reference No: DIN-2026-GST-09281-ND
Office of the Deputy Commissioner of State Tax, Special Circle, New Delhi
To: M/s Vyapaar Enterprises Pvt Ltd, GSTIN: 07AAACV1234F1Z8
SUBJECT: SUMMARY OF SHOW CAUSE NOTICE UNDER SECTION 73(1) OF CGST ACT, 2017 FOR FY 2023-24
Brief facts: Verification of GSTR-2B vs GSTR-3B reveals an ineligible input tax credit mismatch of ₹1,85,420 claimed against cancelled supplier M/s Apex Tech Solutions.
Tax Demand: ₹1,85,420 | Interest u/s 50: ₹33,375 | Penalty u/s 73(9): ₹18,542 | Total Demand: ₹2,37,337.
Reply required by: 15-Nov-2026. Failure to reply will lead to ex-parte demand order.`,
    confidence: 0.96,
  },

  'it-148a': {
    id: 'it-148a',
    title: 'Income Tax Sec 148A (Cash Deposits)',
    authority: 'National Faceless Assessment Centre (NFAC), Central Board of Direct Taxes, New Delhi',
    form: 'Notice under Section 148A(b) of Income-tax Act, 1961',
    issue: 'High-value cash deposits of ₹42,50,000 detected in Current Account during FY 2022-23 (AY 2023-24) exceeding declared gross turnover by ₹28,00,000. Escapement of income chargeable to tax.',
    deadline: '2026-10-25',
    penaltyAmount: 1318200,
    dinNumber: 'ITBA/AST/S/148A/2026-27/10892014',
    documents: [
      'Audited Profit & Loss Statement & Balance Sheet (AY 2023-24)',
      'Complete Bank Statements for all current accounts with deposit narrations',
      'Cash Book and Day Book ledgers for FY 2022-23',
      'Daily cash sales register and VAT/GST monthly returns',
    ],
    sampleText: `GOVERNMENT OF INDIA - MINISTRY OF FINANCE - INCOME TAX DEPARTMENT
NATIONAL FACELESS ASSESSMENT CENTRE, DELHI
Notice under clause (b) of Section 148A of the Income-tax Act, 1961
DIN: ITBA/AST/S/148A/2026-27/10892014
PAN: AABCV1234F | AY: 2023-24
Information flagged under Insight Portal: Cash deposits amounting to ₹42,50,000 in Current Account No. 00210200001234 maintained with HDFC Bank.
Assessing Officer has reason to believe income chargeable to tax has escaped assessment.
Estimated tax liability: ₹13,18,200. Penalty applicable up to 200% u/s 270A.
You are hereby required to furnish reply by 25-Oct-2026.`,
    confidence: 0.94,
  },

  'epfo-7a': {
    id: 'epfo-7a',
    title: 'EPFO Sec 7A (PF Arrears)',
    authority: "Employees' Provident Fund Organisation, Regional Office, Delhi North",
    form: 'Summons & Notice under Section 7A, EPF & MP Act, 1952',
    issue: 'Alleged non-enrollment of 24 contractual security and housekeeping staff from April 2023 to March 2026 and default in timely remittance of statutory dues.',
    deadline: '2026-11-05',
    penaltyAmount: 427440,
    dinNumber: 'EPFO/RO/DEL-N/7A/2026/4109',
    documents: [
      'Master Attendance Registers for outsourced personnel',
      'Wage / Salary payment sheets (Form 10)',
      'Contractor service agreements and monthly invoices',
      'Bank disbursement proof for staff salaries',
    ],
    sampleText: `EMPLOYEES' PROVIDENT FUND ORGANISATION
REGIONAL OFFICE: DELHI NORTH, BHIKAJI CAMA PLACE, NEW DELHI
Case Ref: EPFO/RO/DEL-N/7A/2026/4109
Establishment Code: DL/CPM/0045210/000
SUMMONS UNDER SECTION 7A OF EPF & MP ACT, 1952
Whereas an inquiry under section 7A is instituted to determine dues payable in respect of 24 non-enrolled contractual employees.
Assessed Principal Dues: ₹3,12,000 | Damages u/s 14B: ₹78,000 | Interest u/s 7Q: ₹37,440 | Total: ₹4,27,440 (Late fee ₹50/day).
Statutory hearing date: 05-Nov-2026 at 11:00 AM.`,
    confidence: 0.91,
  },
}

export const GENESIS_HASH = '0'.repeat(64)
