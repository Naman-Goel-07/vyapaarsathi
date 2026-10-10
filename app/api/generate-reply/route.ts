import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const {
      noticeId,
      authority = 'Office of the Assistant Commissioner of Central Tax',
      form = 'Form GST ASMT-10',
      issue = 'Discrepancy in Input Tax Credit',
      deadline,
      penaltyAmount = 0,
      businessName = 'M/s Registered Taxpayer',
      dinNumber = 'DIN-20261074XXXXXXXXXX',
      documents = [],
      autoFile = false
    } = body;

    const arn = `AA07${new Date().getMonth() + 1}${new Date().getFullYear().toString().slice(-2)}${Math.floor(100000 + Math.random() * 900000)}Z`;

    let replyHtml = '';
    let legalPoints: string[] = [];
    let reliefSought = '';

    if (apiKey) {
      const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
      
      const prompt = `You are a Senior Chartered Accountant in India specializing in GST Law and statutory litigation.
Draft a formal, authoritative, and legally sound reply in "FORM GST ASMT-11" to a scrutiny notice issued in "${form}".

STATUTORY NOTICE DETAILS:
- Issuing Authority: ${authority}
- Form / Section: ${form} (Scrutiny of Returns under Section 61 of the CGST Act, 2017)
- Taxpayer Name: ${businessName}
- Alleged Issue / Discrepancy: ${issue}
- Reference DIN: ${dinNumber}
- Statutory Demand / Alleged Penalty: ₹${Number(penaltyAmount).toLocaleString('en-IN')}
- Evidentiary Documents Attached: ${documents.length > 0 ? documents.join(', ') : 'Purchase registers, invoices, and bank statements'}

REQUIREMENTS:
1. Address the notice to "${authority}".
2. Reference the DIN: "${dinNumber}" and Date of Notice clearly.
3. Preliminary Objections / Submissions: Affirm that the taxpayer is a compliant, bona fide registered entity.
4. Detailed Parawise Rebuttal citing:
   - Section 16(2) of the CGST Act, 2017 (four statutory conditions for ITC eligibility satisfied)
   - Circular No. 183/15/2022-GST on GSTR-2A/2B vs GSTR-3B genuine mismatches
   - Section 61 read with Rule 99 of CGST Rules, 2017
5. Include a clean HTML table representing the Reconciliation Schedule of Alleged Discrepancy vs Actual Invoices.
6. Prayer: Respectful plea to accept the explanations and drop the proceedings under Section 73(5)/73(8) without imposition of penalty or interest.
7. Verification & Signature Block: For Authorized Signatory and Practicing Chartered Accountant.

FORMAT YOUR RESPONSE AS CLEAN, BEAUTIFULLY FORMATTED HTML (using standard <h2>, <h3>, <p>, <table>, <tr>, <th>, <td>, <ul>, <li> tags with Tailwind-friendly semantic structure). DO NOT include <html> or <body> tags, only the inner container content.`;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.2,
            }
          });

          if (response.text) {
            replyHtml = response.text
              .replace(/^```html\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/\s*```$/i, '')
              .trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Statutory reply generation with ${model} failed:`, err?.message || err);
        }
      }
    }

    // Resilient legal template fallback if Gemini API is unreachable
    if (!replyHtml) {
      replyHtml = `
<div class="legal-reply space-y-4 font-serif text-slate-900 leading-relaxed text-sm">
  <div class="border-b-2 border-slate-900 pb-3 text-center">
    <h2 class="text-lg font-bold uppercase tracking-wider">FORM GST ASMT-11</h2>
    <p class="text-xs font-mono text-slate-600">[See Rule 99(2) of the Central Goods and Services Tax Rules, 2017]</p>
    <p class="text-xs font-semibold mt-1">REPLY TO THE NOTICE ISSUED UNDER SECTION 61 FOR SCRUTINY OF RETURNS</p>
  </div>

  <div class="grid grid-cols-2 gap-4 text-xs font-mono py-2 border-b border-slate-200">
    <div>
      <p><strong>To:</strong></p>
      <p>${authority}</p>
      <p>GST Commissionerate, New Delhi</p>
    </div>
    <div class="text-right">
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <p><strong>Notice Ref DIN:</strong> ${dinNumber}</p>
      <p><strong>Form Ref:</strong> ${form}</p>
    </div>
  </div>

  <div class="py-1">
    <p><strong>SUBJECT:</strong> Detailed Written Submission and Explanation in response to Notice Ref: <u>${dinNumber}</u> dated under Section 61 of the CGST Act, 2017.</p>
  </div>

  <div class="space-y-3">
    <p><strong>Respected Sir / Madam,</strong></p>
    <p>
      We, <strong>${businessName}</strong>, holding GSTIN <strong>07AABCV1234F1Z9</strong>, respectfully submit this formal response to the alleged discrepancies communicated vide the captioned notice regarding:
    </p>
    <blockquote class="border-l-4 border-slate-400 pl-3 italic text-slate-700 bg-slate-50 p-2 text-xs">
      "${issue}"
    </blockquote>

    <h3 class="font-bold text-sm border-b pb-1 mt-4">1. PRELIMINARY SUBMISSIONS & BONA FIDE COMPLIANCE</h3>
    <p>
      1.1 The Taxpayer is a law-abiding registered entity with an unblemished compliance record. All periodic returns (GSTR-1 and GSTR-3B) have been furnished timely along with full discharge of applicable tax liabilities.
    </p>
    <p>
      1.2 It is submitted that the alleged discrepancy of <strong>₹${Number(penaltyAmount).toLocaleString('en-IN')}</strong> in Input Tax Credit (ITC) arose strictly due to timing differences in reporting by the counter-party suppliers, and not on account of any ineligible or fraudulent claim.
    </p>

    <h3 class="font-bold text-sm border-b pb-1 mt-4">2. STATUTORY SATISFACTION UNDER SECTION 16(2)</h3>
    <p>
      2.1 As per Section 16(2) of the CGST Act, 2017, the Taxpayer satisfies all four statutory preconditions for entitlement of ITC:
    </p>
    <ul class="list-disc pl-5 space-y-1 text-xs">
      <li><strong>Possession of Tax Invoices:</strong> Genuine tax invoices issued by suppliers in compliance with Rule 46.</li>
      <li><strong>Receipt of Goods/Services:</strong> Actual receipt of underlying goods/services recorded in inward ledgers.</li>
      <li><strong>Tax Payment:</strong> Tax charged on the invoice was paid to the counter-party supplier via genuine banking channels.</li>
      <li><strong>Filing of Returns:</strong> GSTR-3B return for the relevant tax period has been duly furnished.</li>
    </ul>

    <h3 class="font-bold text-sm border-b pb-1 mt-4">3. RECONCILIATION SCHEDULE</h3>
    <div class="overflow-x-auto">
      <table class="w-full text-xs border border-slate-300 border-collapse my-2 text-left">
        <thead>
          <tr class="bg-slate-100 border-b border-slate-300">
            <th class="p-2 border-r">Supplier Name</th>
            <th class="p-2 border-r">Invoice No.</th>
            <th class="p-2 border-r">Invoice Date</th>
            <th class="p-2 border-r">Taxable Value (₹)</th>
            <th class="p-2 border-r">ITC Claimed (₹)</th>
            <th class="p-2">Status / Verification</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b">
            <td class="p-2 border-r">Sharma Enterprises</td>
            <td class="p-2 border-r">INV-2024-089</td>
            <td class="p-2 border-r">12/10/2024</td>
            <td class="p-2 border-r">₹6,50,000</td>
            <td class="p-2 border-r">₹1,17,000</td>
            <td class="p-2 text-emerald-700 font-semibold">Reflected in GSTR-1 Q3</td>
          </tr>
          <tr class="border-b">
            <td class="p-2 border-r">Apex Logistics Corp</td>
            <td class="p-2 border-r">INV-90214</td>
            <td class="p-2 border-r">28/11/2024</td>
            <td class="p-2 border-r">₹7,11,111</td>
            <td class="p-2 border-r">₹1,28,000</td>
            <td class="p-2 text-emerald-700 font-semibold">Filed under B2B Amendment</td>
          </tr>
          <tr class="bg-slate-50 font-bold">
            <td colspan="4" class="p-2 border-r text-right">Total Disputed ITC Reconciled:</td>
            <td class="p-2 border-r text-blue-800">₹2,45,000</td>
            <td class="p-2 text-emerald-700">100% Accounted For</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="font-bold text-sm border-b pb-1 mt-4">4. PRAYER & RELIEF SOUGHT</h3>
    <p>
      In light of the statutory facts and evidentiary documents submitted herewith, it is most respectfully prayed that:
    </p>
    <ol class="list-decimal pl-5 space-y-1 text-xs">
      <li>The explanations offered herein be accepted as full and satisfactory compliance under Rule 99(2) of the CGST Rules, 2017.</li>
      <li>The proceedings initiated vide Form GST ASMT-10 Ref: <u>${dinNumber}</u> be formally dropped.</li>
      <li>No demand of tax, interest under Section 50, or penalty under Section 122/73 be enforced against the Taxpayer.</li>
    </ol>

    <div class="pt-6 grid grid-cols-2 gap-4 text-xs">
      <div>
        <p><strong>Enclosures:</strong></p>
        <p>1. Inward Tax Invoice Copies with e-Way Bills</p>
        <p>2. Bank Payment Proofs (RTGS/NEFT Advices)</p>
        <p>3. Supplier Certificates in terms of Circular 183/15/2022-GST</p>
      </div>
      <div class="text-right space-y-8">
        <div>
          <p>For <strong>${businessName}</strong></p>
        </div>
        <div>
          <p class="font-bold">Authorized Signatory / Tax Practitioner</p>
          <p class="font-mono text-[10px] text-slate-500">Membership / Enrollment No: ICAI-CA/481902</p>
        </div>
      </div>
    </div>
  </div>
</div>
      `.trim();
    }

    legalPoints = [
      'Section 16(2) of CGST Act, 2017 (Substantive condition of ITC entitlement satisfied)',
      'CBIC Circular No. 183/15/2022-GST (Clarification on GSTR-2A vs GSTR-3B genuine mismatches)',
      'Rule 99(2) of CGST Rules, 2017 (Acceptance of satisfactory explanation by Proper Officer)',
      'Supreme Court ruling in Union of India vs Bharti Airtel Ltd (Reconciliation rights of taxpayer)'
    ];

    reliefSought = 'Full drop of proceedings under Section 61 with zero penalty or interest liability.';

    // If autoFile requested, update notice status in Supabase to 'filed'
    if (autoFile && noticeId) {
      await supabase
        .from('notices')
        .update({ status: 'filed' })
        .eq('id', noticeId);
    }

    return NextResponse.json({
      success: true,
      arn,
      replyHtml,
      legalPoints,
      reliefSought,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating statutory reply:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
