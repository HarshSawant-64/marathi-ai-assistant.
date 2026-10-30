const GENERAL_REPLIES = {
  'mr-IN': 'नमस्कार! मी सध्या नमुना उत्तर देत आहे. तुम्हाला काय जाणून घ्यायचे आहे?',
  'hi-IN': 'नमस्ते! मैं अभी नमूना जवाब दे रहा हूँ। आप क्या जानना चाहते हैं?',
  'en-IN': 'Hello! I am using a sample reply in this prototype. What would you like to know?',
};

const PUBLIC_SERVICE_TERMS = [
  'government', 'scheme', 'scholarship', 'सरकारी', 'योजना', 'छात्रवृत्ति', 'शासकीय', 'शिष्यवृत्ती',
];

const UNVERIFIED_REPLIES = {
  'mr-IN': 'ही नमुना प्रतिक्रिया आहे. शासकीय योजनांची माहिती येथे पडताळलेली नाही. कृपया अधिकृत सरकारी संकेतस्थळावर तपासा.',
  'hi-IN': 'यह एक नमूना जवाब है। सरकारी योजनाओं की जानकारी यहाँ सत्यापित नहीं है। कृपया आधिकारिक सरकारी वेबसाइट पर जाँचें।',
  'en-IN': 'This is a sample reply. Government information is not verified here. Please check the official government website.',
};

const SCHOLARSHIP_TERMS = ['scholarship', 'छात्रवृत्ति', 'स्कॉलरशिप', 'शिष्यवृत्ती'];
const PORTAL_NAME = /(?:^|[^a-z0-9])(?:nsp|mahadbt2?)(?:$|[^a-z0-9])/i;

const SCHOLARSHIP_SOURCE_REPLIES = {
  'mr-IN': 'शिष्यवृत्तीची माहिती शोधण्यासाठी खालील अधिकृत पोर्टल पहा. पात्रता, कागदपत्रे आणि तारखा योजनेनुसार बदलतात; अर्ज करण्यापूर्वी संबंधित पोर्टलवरील सध्याची माहिती तपासा.',
  'hi-IN': 'छात्रवृत्ति की जानकारी के लिए नीचे दिए गए आधिकारिक पोर्टल देखें। पात्रता, दस्तावेज़ और तारीखें योजना के अनुसार बदलती हैं; आवेदन से पहले संबंधित पोर्टल पर ताज़ा जानकारी जाँचें।',
  'en-IN': 'For scholarship information, check the official portals below. Eligibility, documents, and dates vary by scheme; verify current details on the relevant portal before applying.',
};

const SCHOLARSHIP_SOURCES = [
  {
    title: 'National Scholarship Portal — Students',
    scope: 'india',
    url: 'https://scholarships.gov.in/Students',
  },
  {
    title: 'MahaDBT 2.0 — Maharashtra application portal',
    scope: 'maharashtra',
    url: 'https://mahadbt2.maharashtra.gov.in/',
  },
  {
    title: 'MahaDBT — Scheme-wise FAQs and notices',
    scope: 'maharashtra',
    url: 'https://mahadbt.maharashtra.gov.in/home/faq',
  },
];

export function findOfficialSourceReply(message, language) {
  const normalized = message.toLocaleLowerCase();
  if (!SCHOLARSHIP_TERMS.some((term) => normalized.includes(term)) && !PORTAL_NAME.test(normalized)) return null;

  return {
    reply: SCHOLARSHIP_SOURCE_REPLIES[language] || SCHOLARSHIP_SOURCE_REPLIES['mr-IN'],
    sources: SCHOLARSHIP_SOURCES.map((source) => ({ ...source })),
  };
}

export function createMockReply(message, language) {
  const normalized = message.toLocaleLowerCase();
  if (PUBLIC_SERVICE_TERMS.some((term) => normalized.includes(term))) {
    return UNVERIFIED_REPLIES[language] || UNVERIFIED_REPLIES['mr-IN'];
  }
  return GENERAL_REPLIES[language] || GENERAL_REPLIES['mr-IN'];
}
