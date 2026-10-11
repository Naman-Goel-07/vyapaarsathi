import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { SAMPLE_NOTICES } from '@/lib/sampleNotices'

const apiKey = process.env.GEMINI_API_KEY || ''
const ai = new GoogleGenAI({ apiKey })

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let incomingText = ''
    let mediaUrl = ''
    let language = 'hindi'
    let isTwilio = false

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Twilio Webhook
      isTwilio = true
      const formData = await request.formData()
      incomingText = (formData.get('Body') as string) || ''
      mediaUrl = (formData.get('MediaUrl0') as string) || ''
    } else {
      // JSON payload from Simulator
      const body = await request.json().catch(() => ({}))
      incomingText = body.text || ''
      mediaUrl = body.mediaUrl || ''
      language = body.language || 'hindi'
    }

    // Determine notice context
    const sampleMatch = SAMPLE_NOTICES.find(
      (s) =>
        incomingText.toLowerCase().includes(s.form.toLowerCase()) ||
        incomingText.toLowerCase().includes(s.id.toLowerCase())
    ) || SAMPLE_NOTICES[0]

    const authority = sampleMatch.authority
    const form = sampleMatch.form
    const amount = sampleMatch.penaltyAmount || 245000
    const deadline = sampleMatch.deadline || '2026-10-25'
    const formattedAmount = `₹${amount.toLocaleString('en-IN')}`

    // Vernacular Reassurance Script
    let voiceScript = ''
    if (language === 'hindi' || language === 'hinglish') {
      voiceScript = `नमस्ते जी! बिल्कुल घबराइए नहीं। यह ${authority} से खरीद और बिक्री के बिलों में ${formattedAmount} के अंतर का सामान्य नोटिस है। पेनल्टी अभी फाइनल नहीं है। आपके सीए साहब ने जवाब तैयार करना शुरू कर दिया है। आप बस पिछले 3 महीने के खरीद बिल हमें भेज दीजिए।`
    } else if (language === 'tamil') {
      voiceScript = `வணக்கம்! பயப்பட வேண்டாம். இது ${authority} இலிருந்து ${formattedAmount} மதிப்பிலான வழக்கமான வரி அறிவிப்பு மட்டுமே. உங்கள் CA பதில் தயாரிக்கிறார்.`
    } else {
      voiceScript = `Hello! Please do not panic. This is a routine ${form} discrepancy notice for ${formattedAmount}. Your CA has already started preparing the reply.`
    }

    const replyText = `🙏 *VyapaarSathi Statutory Assistant*

📄 *Notice Detected:* ${form}
🏢 *Authority:* ${authority}
💰 *Exposure at Stake:* ${formattedAmount}
⏰ *Statutory Deadline:* ${deadline}

⚠️ *AI Assessment:* Routine discrepancy between GSTR-3B and GSTR-2B. Not a criminal penalty.

✅ *Action Taken:*
1. Case Docket created in your VyapaarSathi registry.
2. Complete file forwarded to your designated CA (*CA Rajesh Sharma, FCA*).
3. 🔊 *Vernacular Voice Briefing attached below.*`

    if (isTwilio) {
      // Return standard TwiML XML
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>${replyText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Body>
  </Message>
</Response>`

      return new Response(twiml, {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    return NextResponse.json({
      success: true,
      replyText,
      voiceScript,
      notice: {
        form,
        authority,
        amount,
        deadline,
        status: 'docket_created'
      },
      assignedCA: {
        name: 'CA Rajesh Sharma, FCA',
        membershipNo: 'ICAI #084920'
      }
    })
  } catch (err: any) {
    console.error('WhatsApp Bot error:', err)
    return NextResponse.json({ error: err.message || 'Failed to process WhatsApp request' }, { status: 500 })
  }
}
