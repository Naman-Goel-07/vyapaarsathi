type Language = 'en' | 'hi'
type Topic = 'gstBasics' | 'gstRates' | 'registration' | 'returns' | 'composition' | 'credit' | 'incomeTax' | 'itr' | 'businessTax'

type Resource = {
  lang: Language
  topic: Topic
  title: string
  summary: string
}

export type EducationBlog = Resource & { publisher: string; url: string }
export type EducationVideo = Resource & { id: string }

export const educationBlogs: EducationBlog[] = [
  {
    lang: 'en', topic: 'gstBasics', publisher: 'Razorpay Learn', title: 'GST Guide',
    url: 'https://razorpay.com/learn/gst-goods-and-services-tax-guide/',
    summary: 'Learn which GST applies to local and interstate sales and how input tax credit works.',
  },
  {
    lang: 'en', topic: 'gstRates', publisher: 'Vyapar', title: 'GST Rates in India 2026–27',
    url: 'https://vyaparapp.in/blog/new-gst-rates/',
    summary: 'Understand the GST 2.0 shift to main rates of 5% and 18%, with a special 40% rate for select items. Compare old and new rates by product.',
  },
  {
    lang: 'en', topic: 'itr', publisher: 'BankBazaar', title: 'How to File ITR Online in 2026',
    url: 'https://www.bankbazaar.com/tax/step-by-step-guide-efile-income-tax-return-online.html',
    summary: 'Follow the steps from calculating your tax to filing your return online. The guide also covers offline filing for eligible super senior citizens.',
  },
  {
    lang: 'en', topic: 'incomeTax', publisher: 'ClearTax', title: 'Income Tax Changes From 1 April 2026',
    url: 'https://cleartax.in/s/income-tax-changes-from-april-2026',
    summary: 'Review 15 changes under the Income-tax Act, 2025, including updated forms. The FAQs cover Tax Year, slabs and the rebate.',
  },
  {
    lang: 'en', topic: 'businessTax', publisher: 'Tally', title: 'Presumptive Taxation under Section 44AD',
    url: 'https://tallysolutions.com/accounting/presumptive-taxation-section-44ad/',
    summary: 'See how eligible small businesses estimate taxable profit at 6% or 8% of turnover. Learn how the scheme can simplify record keeping and cash flow planning.',
  },
  {
    lang: 'hi', topic: 'gstBasics', publisher: 'बजाज फिनसर्व', title: 'GST क्या है: फुल फॉर्म, अर्थ और विशेषताएँ',
    url: 'https://www.bajajfinserv.in/hindi/gst-full-form',
    summary: 'GST का पूरा नाम जानें और समझें कि इसने किन पुराने अप्रत्यक्ष करों की जगह ली। लेख में अलग-अलग भारतीय भाषाओं में GST के नाम भी दिए हैं।',
  },
  {
    lang: 'hi', topic: 'registration', publisher: 'कोटक बैंक', title: 'जीएसटी के लिए ऑनलाइन पंजीकरण कैसे करें',
    url: 'https://www.kotak.bank.in/hi/stories-in-focus/taxes/how-to-register-to-gst.html',
    summary: 'ऑनलाइन आवेदन से प्रमाणपत्र (REG-06) तक की प्रक्रिया जानें। विभाग के REG-03 नोटिस का जवाब REG-04 में दिया जाता है।',
  },
  {
    lang: 'hi', topic: 'returns', publisher: 'बजाज फिनसर्व', title: 'GSTR-3B गाइड',
    url: 'https://www.bajajfinserv.in/hindi/gstr-3b',
    summary: 'GSTR-3B भरने के चरण, देय तारीखें और विलंब शुल्क जानें। देखें कि यह GSTR-1, GSTR-2A और GSTR-2B से कैसे अलग है।',
  },
  {
    lang: 'hi', topic: 'incomeTax', publisher: 'टाटा कैपिटल', title: 'FY 2026–27 के लिए इनकम टैक्स स्लैब और दरें',
    url: 'https://www.tatacapital.com/hindi/blog/wealth-services/personal-income-tax-slabs/',
    summary: 'पुरानी और नई कर व्यवस्था के स्लैब की तुलना करें। जानें कि नई व्यवस्था में पात्र आय पर ₹12 लाख तक की छूट कैसे काम करती है।',
  },
  {
    lang: 'hi', topic: 'itr', publisher: 'रेस्ट द केस', title: 'टैक्स रिटर्न कैसे दाखिल करें?',
    url: 'https://restthecase.com/hi/knowledge-bank/how-to-file-tax-returns',
    summary: 'जानें कि किन व्यक्तियों और व्यवसायों को ITR भरना होता है। कम या शून्य आय होने पर भी रिफंड या घाटा आगे ले जाने के लिए रिटर्न उपयोगी हो सकता है।',
  },
]

export const educationVideos: EducationVideo[] = [
  {
    id: '_y3jXc-5p8k', lang: 'en', topic: 'gstRates', title: 'GST 2.0 Explained: New Tax Rates, Everyday Benefits & Business Opportunities',
    summary: 'An overview of the GST rate changes and how they affect households and businesses.',
  },
  {
    id: 'Zc_7R-xr28g', lang: 'en', topic: 'registration', title: 'First Login to the GST Portal for New Registrants',
    summary: 'GSTN shows how new registrants sign in to the GST portal for the first time.',
  },
  {
    id: '1OMRLYHBuPM', lang: 'en', topic: 'returns', title: 'Filing of GSTR-3B (English)',
    summary: 'A GST Master Class filing demo. Current portal screens and auto-filled fields may differ.',
  },
  {
    id: 't5GLUPSEsoo', lang: 'en', topic: 'incomeTax', title: 'India’s New Income Tax Act 2025: 10 Major Changes Every Taxpayer Must Know',
    summary: 'Ten key changes in the move from the Income-tax Act, 1961 to the Income-tax Act, 2025.',
  },
  {
    id: 'OC4iEVs0jLk', lang: 'en', topic: 'itr', title: 'ITR Filing 2026–27 for Salary Person',
    summary: 'An e-filing demonstration for salaried taxpayers using ITR-1 for FY 2025–26 (AY 2026–27).',
  },
  {
    id: '2A_l1wygOMk', lang: 'hi', topic: 'gstBasics', title: 'हिंदी में जीएसटी की मूल बातें',
    summary: 'ClearTax की शुरुआती गाइड: GST क्या है और इसे पुराने करों की जगह क्यों लाया गया।',
  },
  {
    id: 'G9MsTHlertA', lang: 'hi', topic: 'registration', title: 'सामान्य करदाताओं और कंपोज़िशन डीलरों का पंजीकरण',
    summary: 'GST Master Class में सामान्य और कंपोज़िशन पंजीकरण की प्रक्रिया और उनका अंतर देखें।',
  },
  {
    id: 'LvfXer-VWvc', lang: 'hi', topic: 'returns', title: 'GSTR-3B कैसे भरें (हिंदी)',
    summary: 'GST Master Class में GSTR-3B भरने का तरीका देखें। पोर्टल की मौजूदा स्क्रीन अलग दिख सकती हैं।',
  },
  {
    id: 'Nmi0vw4wVM0', lang: 'hi', topic: 'itr', title: 'ITR-1 कैसे भरें: FY 2025–26 / AY 2026–27',
    summary: 'FinCalC TV का वीडियो, जिसमें वेतन से आय पाने वालों के लिए ITR-1 भरने के चरण दिखाए गए हैं।',
  },
  {
    id: 'pPOpqYwe6Yo', lang: 'hi', topic: 'businessTax', title: 'ITR-4 (सुगम) ऑनलाइन कैसे भरें',
    summary: 'CA सतबीर सिंह अनुमानित कर योजना के तहत पात्र छोटे व्यवसायों और पेशेवरों के लिए ITR-4 समझाते हैं।',
  },
]

export const educationShorts: EducationVideo[] = [
  {
    id: 'auMGuDNAwog', lang: 'hi', topic: 'gstBasics', title: '60 सेकंड में GST समझें',
    summary: 'GST, CGST, SGST, IGST और इनपुट टैक्स क्रेडिट का छोटा परिचय।',
  },
  {
    id: '5zRBzTms7gc', lang: 'hi', topic: 'composition', title: 'GST की कंपोज़िशन योजना',
    summary: 'पात्र छोटे कारोबारों के लिए GST का यह आसान विकल्प कैसे काम करता है।',
  },
  {
    id: 'lCB7Q_MbzwM', lang: 'en', topic: 'credit', title: 'ITC Explained',
    summary: 'See where input tax credit is allowed and where it is blocked.',
  },
  {
    id: '32KhthNKcck', lang: 'hi', topic: 'incomeTax', title: '₹12 लाख तक की आय पर टैक्स छूट',
    summary: 'जानें कि नई कर व्यवस्था में पात्र आय पर टैक्स रिबेट कैसे काम करती है।',
  },
  {
    id: 'uH8IwoEDWNY', lang: 'en', topic: 'itr', title: 'ITR vs Income Tax – Explained',
    summary: 'A filing checklist for FY 2025–26, including checking figures against AIS and Form 26AS.',
  },
  {
    id: '2SA_fvMofVY', lang: 'hi', topic: 'gstBasics', title: 'GST क्या होता है?',
    summary: 'एक आसान उदाहरण से समझें कि GST क्या है।',
  },
  {
    id: 's190Bs7yqzg', lang: 'hi', topic: 'gstBasics', title: 'भारत में GST के प्रकार: CGST, SGST, UTGST और IGST',
    summary: 'जानें कि राज्य के भीतर और राज्यों के बीच बिक्री पर कौन सा GST लगता है।',
  },
  {
    id: 'gwntN3LhV3I', lang: 'hi', topic: 'registration', title: 'क्या ऑनलाइन कारोबार के लिए GST नंबर ज़रूरी है?',
    summary: 'GSTIN क्या है और Amazon, Flipkart या Meesho जैसे मंचों पर बेचते समय पंजीकरण कब ज़रूरी हो सकता है।',
  },
  {
    id: 'fLEGZOR4Qjw', lang: 'hi', topic: 'itr', title: 'मोबाइल से ITR-1 कैसे भरें?',
    summary: 'फोन से FY 2025–26 (AY 2026–27) का ITR-1 भरने का तरीका देखें।',
  },
  {
    id: 'KC-b5dR25B8', lang: 'hi', topic: 'incomeTax', title: '1 अप्रैल 2026 से नया आयकर कानून',
    summary: 'नए आयकर कानून और उसकी लागू होने की तारीख पर एक छोटी खबर।',
  },
]
