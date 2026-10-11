import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export type SupportedLanguage = 
  | 'hinglish' 
  | 'hindi' 
  | 'gujarati' 
  | 'marathi' 
  | 'tamil' 
  | 'telugu' 
  | 'bengali' 
  | 'kannada' 
  | 'english';

const LANGUAGE_CONFIG: Record<SupportedLanguage, { label: string; scriptName: string; example: string }> = {
  hinglish: {
    label: 'Hinglish',
    scriptName: 'conversational Hinglish (Hindi written in Roman English alphabet)',
    example: '"Namaste Ji! Bilkul ghabraane ki zaroorat nahi hai. Yeh notice sirf sale aur purchase bills ke farak ke baare me hai..."'
  },
  hindi: {
    label: 'हिंदी (Hindi)',
    scriptName: 'pure, reassuring conversational Hindi (Devanagari script)',
    example: '"नमस्ते जी! घबराइए नहीं, यह सिर्फ बिक्री और खरीद के बिलों का मिलान करने का रूटीन नोटिस है..."'
  },
  gujarati: {
    label: 'ગુજરાતી (Gujarati)',
    scriptName: 'warm, conversational Gujarati (Gujarati script)',
    example: '"નમસ્તે જી! જરાય ચિંતા ન કરશો. આ વેચાણ અને ખરીદીના બિલોના તફાવત બાબતે સામાન્ય નોટિસ છે..."'
  },
  marathi: {
    label: 'मराठी (Marathi)',
    scriptName: 'warm, conversational Marathi (Devanagari script)',
    example: '"नमस्कार! मुळीच काळजी करू नका. ही केवळ खरेदी आणि विक्री बिलांमधील तफावतीची नियमित नोटीस आहे..."'
  },
  tamil: {
    label: 'தமிழ் (Tamil)',
    scriptName: 'respectful, conversational Tamil (Tamil script)',
    example: '"வணக்கம்! தயவுசெய்து பயப்பட வேண்டாம். இது விற்பனை மற்றும் கொள்முதல் ரசீதுகளில் உள்ள வேறுபாடுகள் குறித்த வழக்கமான நோட்டீஸ்..."'
  },
  telugu: {
    label: 'తెలుగు (Telugu)',
    scriptName: 'warm, conversational Telugu (Telugu script)',
    example: '"నమస్కారం! అస్సలు కంగారు పడకండి. ఇది కొనుగోలు మరియు అమ్మకాల బిల్లులలోని వ్యత్యాసంపై వచ్చిన సాధారణ నోటీసు..."'
  },
  bengali: {
    label: 'বাংলা (Bengali)',
    scriptName: 'warm, conversational Bengali (Bengali script)',
    example: '"নমস্কার! একদম চিন্তা করবেন না। এটি কেনাবেচার বিলের পার্থক্যের জন্য আসা একটি সাধারণ রুটিন নোটিশ..."'
  },
  kannada: {
    label: 'ಕನ್ನಡ (Kannada)',
    scriptName: 'warm, conversational Kannada (Kannada script)',
    example: '"ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ಭಯಪಡಬೇಡಿ. ಇದು ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಬಿಲ್‌ಗಳ ವ್ಯತ್ಯಾಸದ ಬಗ್ಗೆ ಬಂದಿರುವ ಸಾಮಾನ್ಯ ನೋಟೀಸ್..."'
  },
  english: {
    label: 'English',
    scriptName: 'simple, empathetic Indian English suitable for a retail business owner',
    example: '"Hello! Please do not panic, this is a routine return mismatch scrutiny notice..."'
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      authority = 'GST Department',
      form = 'Form GST ASMT-10',
      issue = 'Tax discrepancy',
      deadline = '15 days',
      penaltyAmount = null,
      businessName = 'Vyapaari Ji',
      language = 'hinglish'
    } = body;

    const selectedLang: SupportedLanguage = (LANGUAGE_CONFIG[language as SupportedLanguage] ? language : 'hinglish') as SupportedLanguage;
    const config = LANGUAGE_CONFIG[selectedLang];

    const hasValidAmount = penaltyAmount !== null && penaltyAmount !== undefined && Number(penaltyAmount) > 0;
    const formattedAmount = hasValidAmount
      ? (Number(penaltyAmount) >= 100000 
          ? `₹${(Number(penaltyAmount) / 100000).toFixed(2)} Lakh`
          : `₹${Number(penaltyAmount).toLocaleString('en-IN')}`)
      : 'demand amount not stated';

    let script = '';

    if (apiKey) {
      const candidateModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

      const prompt = `You are a trusted, reassuring Chartered Accountant in India speaking directly to a shopkeeper or small business owner (${businessName}) who is frightened after receiving a government tax notice (${form}).

NOTICE PARTICULARS:
- Issuing Office: ${authority}
- Form: ${form}
- Alleged Issue: ${issue}
- Amount at Stake: ${formattedAmount}
- Deadline: ${deadline || 'Within 15 days'}

TASK:
Write a 45-60 word spoken audio script in ${config.scriptName}. If the amount at stake is "demand amount not stated", explicitly state that the demand amount is not stated or to be confirmed.
Example style: ${config.example}

STRUCTURE:
1. Reassurance: Tell them calmly not to panic (penalty is NOT final).
2. The Real Meaning: Explain what the government is asking in one super-simple sentence without intimidating legal jargon.
3. Next Action: Tell them to simply share their purchase invoices with their CA so the reply can be filed.

OUTPUT FORMAT:
Return strictly a valid JSON object:
{
  "script": "The exact spoken words to be read out aloud in ${config.scriptName}",
  "takeaway": "One short sentence summary (max 10 words)",
  "urgency": "Normal"
}`;

      for (const model of candidateModels) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_3S')), 3000)
          );

          const response = await Promise.race([
            ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              }
            }),
            timeoutPromise
          ]) as any;

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed.script) {
              script = parsed.script;
              break;
            }
          }
        } catch (err: any) {
          console.warn(`Voice briefing generation with ${model} in ${selectedLang} timed out or 503:`, err?.message || err);
          break; // Avoid compounding delays during demo
        }
      }
    }

    // High quality resilient fallbacks for all regional languages
    if (!script) {
      switch (selectedLang) {
        case 'hindi':
          script = hasValidAmount
            ? `नमस्ते जी! बिल्कुल घबराइए नहीं। यह ${authority} से खरीद और बिक्री के बिलों में ${formattedAmount} के अंतर का सामान्य नोटिस है। पेनल्टी अभी फाइनल नहीं है। आपके सीए साहब ने जवाब तैयार करना शुरू कर दिया है। आप बस पिछले 3 महीने के खरीद बिल हमें भेज दीजिए।`
            : `नमस्ते जी! बिल्कुल घबराइए नहीं। यह ${authority} से आया सामान्य नोटिस है (डिमांड राशि स्पष्ट नहीं है - demand amount not stated)। पेनल्टी अभी फाइनल नहीं है। आपके सीए साहब ने जांच शुरू कर दी है। आप बस संबंधित बिल हमें भेज दीजिए।`;
          break;
        case 'gujarati':
          script = hasValidAmount
            ? `નમસ્તે જી! જરાય ચિંતા કરશો નહીં. આ ${authority} તરફથી ખરીદી અને વેચાણના બિલોમાં ${formattedAmount} ના તફાવત બાબતે આવેલી સામાન્ય નોટિસ છે. આ દંડ હજુ આખરી નથી. તમારા CA સાહેબે જવાબ તૈયાર કરવાનું શરૂ કરી દીધું છે, માત્ર ખરીદીના બિલો મોકલી આપો.`
            : `નમસ્તે જી! જરાય ચિંતા કરશો નહીં. આ ${authority} તરફથી આવેલી સામાન્ય નોટિસ છે (demand amount not stated). આ દંડ હજુ આખરી નથી. તમારા CA સાહેબે તપાસ શરૂ કરી દીધી છે.`;
          break;
        case 'marathi':
          script = hasValidAmount
            ? `नमस्कार! मुळीच काळजी करू नका. ही ${authority} कडून खरेदी आणि विक्री बिलांमधील ${formattedAmount} च्या तफावतीची नेहमीची नोटीस आहे. दंड अजून फायनल झालेला नाही. तुमच्या सीए सरांनी उत्तर तयार करण्यास सुरुवात केली आहे, फक्त खरेदी बिले पाठवून द्या.`
            : `नमस्कार! मुळीच काळजी करू नका. ही ${authority} कडून आलेली नेहमीची नोटीस आहे (demand amount not stated). दंड अजून फायनल झालेला नाही. तुमच्या सीए सरांनी तपासणी सुरू केली आहे.`;
          break;
        case 'tamil':
          script = hasValidAmount
            ? `வணக்கம்! தயவுசெய்து கவலைப்பட வேண்டாம். இது ${authority} இலிருந்து கொள்முதல் மற்றும் விற்பனை ரசீதுகளில் உள்ள ${formattedAmount} வேறுபாட்டிற்கான வழக்கமான நோட்டீஸ் ஆகும். அபராதம் இன்னும் உறுதியாகவில்லை. உங்கள் CA பதில் தயாரிக்கத் தொடங்கிவிட்டார், கொள்முதல் ரசீதுகளை மட்டும் அனுப்பவும்.`
            : `வணக்கம்! தயவுசெய்து கவலைப்பட வேண்டாம். இது ${authority} இலிருந்து வந்த வழக்கமான நோட்டீஸ் (demand amount not stated). அபராதம் இன்னும் உறுதியாகவில்லை. உங்கள் CA ஆய்வு செய்யத் தொடங்கிவிட்டார்.`;
          break;
        case 'telugu':
          script = hasValidAmount
            ? `నమస్కారం! అస్సలు భయపడవద్దు. ఇది ${authority} నుండి కొనుగోలు మరియు అమ్మకాల బిల్లులలోని ${formattedAmount} వ్యత్యాసంపై వచ్చిన సాధారణ నోటీసు మాత్రమే. పెనాల్టీ ఇంకా ఖరారు కాలేదు. మీ CA గారు సమాధానం సిద్ధం చేస్తున్నారు, కేవలం కొనుగోలు బిల్లులు పంపించండి.`
            : `నమస్కారం! అస్సలు భయపడవద్దు. ఇది ${authority} నుండి వచ్చిన సాధారణ నోటీసు (demand amount not stated). పెనాల్టీ ఇంకా ఖరారు కాలేదు. మీ CA గారు పరిశీలిస్తున్నారు.`;
          break;
        case 'bengali':
          script = hasValidAmount
            ? `নমস্কার! একদম চিন্তা করবেন না। এটি ${authority} থেকে কেনাবেচার বিলে ${formattedAmount} টাকার পার্থক্যের জন্য আসা একটি সাধারণ রুটিন নোটিশ। জরিমানা এখনও চূড়ান্ত নয়। আপনার সিএ সাহেব জবাব তৈরি করা শুরু করেছেন, শুধু ক্রয়ের বিলগুলো পাঠিয়ে দিন।`
            : `নমস্কার! একদম চিন্তা করবেন না। এটি ${authority} থেকে আসা একটি সাধারণ রুটিন নোটিশ (demand amount not stated)। জরিমানা এখনও চূড়ান্ত নয়। আপনার সিএ সাহেব তদন্ত শুরু করেছেন।`;
          break;
        case 'kannada':
          script = hasValidAmount
            ? `ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ಆತಂಕಪಡಬೇಡಿ. ಇದು ${authority} ಇಂದ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಬಿಲ್‌ಗಳಲ್ಲಿ ${formattedAmount} ವ್ಯತ್ಯಾಸದ ಬಗ್ಗೆ ಬಂದಿರುವ ಸಾಮಾನ್ಯ ನೋಟೀಸ್. ದಂಡ ಇನ್ನೂ ಅಂತಿಮವಾಗಿಲ್ಲ. ನಿಮ್ಮ ಸಿಎ ಅವರು ಉತ್ತರ ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದಾರೆ, ಖರೀದಿ ಬಿಲ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ.`
            : `ನಮಸ್ಕಾರ! ದಯವಿಟ್ಟು ಆತಂಕಪಡಬೇಡಿ. ಇದು ${authority} ಇಂದ ಬಂದಿರುವ ಸಾಮಾನ್ಯ ನೋಟೀಸ್ (demand amount not stated). ದಂಡ ಇನ್ನೂ ಅಂತಿಮವಾಗಿಲ್ಲ. ನಿಮ್ಮ ಸಿಎ ಅವರು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ.`;
          break;
        case 'english':
          script = hasValidAmount
            ? `Hello! Please do not panic. This is a routine notice from ${authority} regarding an invoice mismatch of ${formattedAmount}. This is not a final penalty. Your CA has already started preparing the legal response. Just share your purchase invoices so we can close this file.`
            : `Hello! Please do not panic. This is a routine notice from ${authority} where the demand amount is not stated. This is not a final penalty. Your CA has already started reviewing the file. Please share your documents so we can clarify this.`;
          break;
        case 'hinglish':
        default:
          script = hasValidAmount
            ? `Namaste Ji! Bilkul ghabraane ki zaroorat nahi hai. Yeh ${authority} se purchase aur sale bills me ${formattedAmount} ke mismatch ka routine notice hai. Yeh koi final penalty nahi hai. Aapke CA sahab ne reply taiyaar karna shuru kar diya hai, bas pichhle 3 mahine ke purchase bills share kar dijiye.`
            : `Namaste Ji! Bilkul ghabraane ki zaroorat nahi hai. Yeh ${authority} se aaya routine notice hai jisme demand amount not stated hai. Yeh koi final penalty nahi hai. Aapke CA sahab ne review shuru kar diya hai.`;
          break;
      }
    }

    return NextResponse.json({
      success: true,
      script,
      language: selectedLang,
      languageLabel: config.label,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating voice briefing:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
