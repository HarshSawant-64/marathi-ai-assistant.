from app.models.schemas import LanguageCode

_NOT_VERIFIED = {
    "mr-IN": "ही नमुना प्रतिक्रिया आहे. सरकारी योजनांची माहिती येथे पडताळलेली नाही. कृपया अधिकृत सरकारी संकेतस्थळावर तपासा.",
    "hi-IN": "यह एक नमूना जवाब है। यहाँ सरकारी योजनाओं की जानकारी सत्यापित नहीं है। कृपया आधिकारिक सरकारी वेबसाइट पर जाँचें।",
    "en-IN": "This is a sample reply. Government scheme information is not verified here. Please check the official government website.",
}

_GENERAL = {
    "mr-IN": "नमस्कार! मी सध्या नमुना उत्तर देत आहे. तुम्हाला काय जाणून घ्यायचे आहे?",
    "hi-IN": "नमस्ते! मैं अभी नमूना जवाब दे रहा हूँ। आप क्या जानना चाहते हैं?",
    "en-IN": "Hello! I am using a sample reply in this prototype. What would you like to know?",
}


def create_mock_reply(message: str, language: LanguageCode) -> str:
    normalized = message.casefold()
    public_service_terms = (
        "government",
        "scheme",
        "scholarship",
        "सरकारी",
        "योजना",
        "छात्रवृत्ति",
        "शासकीय",
        "शिष्यवृत्ती",
    )
    if any(term in normalized for term in public_service_terms):
        return _NOT_VERIFIED[language]
    return _GENERAL[language]
