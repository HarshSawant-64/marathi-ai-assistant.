import re

from app.models.schemas import AssistantResponse, LanguageCode, OfficialSourceReference

_SCHOLARSHIP_TERMS = (
    "scholarship",
    "scholarships",
    "छात्रवृत्ति",
    "स्कॉलरशिप",
    "शिष्यवृत्ती",
)
_PORTAL_NAME = re.compile(r"(?<![a-z0-9])(?:nsp|mahadbt2?)(?![a-z0-9])")

_SCHOLARSHIP_REPLIES: dict[LanguageCode, str] = {
    "mr-IN": (
        "शिष्यवृत्तीची माहिती शोधण्यासाठी खालील अधिकृत पोर्टल पहा. पात्रता, कागदपत्रे आणि तारखा "
        "योजनेनुसार बदलतात; अर्ज करण्यापूर्वी संबंधित पोर्टलवरील सध्याची माहिती तपासा."
    ),
    "hi-IN": (
        "छात्रवृत्ति की जानकारी के लिए नीचे दिए गए आधिकारिक पोर्टल देखें। पात्रता, दस्तावेज़ और तारीखें "
        "योजना के अनुसार बदलती हैं; आवेदन से पहले संबंधित पोर्टल पर ताज़ा जानकारी जाँचें।"
    ),
    "en-IN": (
        "For scholarship information, check the official portals below. Eligibility, documents, and dates "
        "vary by scheme; verify current details on the relevant portal before applying."
    ),
}

_SCHOLARSHIP_SOURCES = (
    OfficialSourceReference(
        title="National Scholarship Portal — Students",
        scope="india",
        url="https://scholarships.gov.in/Students",
    ),
    OfficialSourceReference(
        title="MahaDBT 2.0 — Maharashtra application portal",
        scope="maharashtra",
        url="https://mahadbt2.maharashtra.gov.in/",
    ),
    OfficialSourceReference(
        title="MahaDBT — Scheme-wise FAQs and notices",
        scope="maharashtra",
        url="https://mahadbt.maharashtra.gov.in/home/faq",
    ),
)


def find_official_scholarship_sources(
    message: str,
    language: LanguageCode,
) -> AssistantResponse | None:
    normalized = message.casefold()
    if not any(term in normalized for term in _SCHOLARSHIP_TERMS) and not _PORTAL_NAME.search(normalized):
        return None

    return AssistantResponse(
        reply=_SCHOLARSHIP_REPLIES[language],
        sources=[source.model_copy(deep=True) for source in _SCHOLARSHIP_SOURCES],
    )
