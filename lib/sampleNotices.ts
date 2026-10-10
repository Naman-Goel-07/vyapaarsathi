export interface SampleNotice {
  id: string;
  title: string;
  authority: string;
  form: string;
  issue: string;
  deadline: string;
  penaltyAmount: number;
  dinNumber: string;
  documents: string[];
  sampleText: string;
  confidence: number;
  action?: string;
  owner_role?: 'owner' | 'ca';
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
];

export function getSampleNoticeById(id: string): SampleNotice | undefined {
  return SAMPLE_NOTICES.find(n => n.id === id);
}
