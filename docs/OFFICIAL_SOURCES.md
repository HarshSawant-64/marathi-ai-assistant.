# Official Scholarship Sources

Reviewed on 2026-10-29. This is the initial Phase F source list for scholarship questions.

## Curated links

- **National Scholarship Portal — Students** ([scholarships.gov.in](https://scholarships.gov.in/Students)) — central portal for student schemes, eligibility information, and application services.
- **MahaDBT 2.0 — Maharashtra application portal** ([mahadbt2.maharashtra.gov.in](https://mahadbt2.maharashtra.gov.in/)) — the MahaDBT FAQ points applicants to this portal for fresh and renewal applications for academic year 2026–27.
- **MahaDBT — scheme FAQs and notices** ([mahadbt.maharashtra.gov.in](https://mahadbt.maharashtra.gov.in/home/faq)) — Maharashtra scheme FAQs and notices, including the notice directing 2026–27 applications to MahaDBT 2.0.

The portal scopes are shown beside each result so users can choose the source relevant to them. The app does not select a scheme or assess eligibility.

## Current behavior

The app checks scholarship-related words in Marathi, Hindi, and English against a small local allowlist. A match returns a short localized reminder and the three links above. It does not scrape the sites, store their page content, or send the scholarship question to an AI provider. The mobile mock service and backend keep matching copies of the catalog; update both when a source changes.

The MahaDBT FAQ currently says the older MahaDBT 1.0 portal handles some 2025–26 applications and that 2026–27 fresh and renewal applications go through MahaDBT 2.0. The app therefore links directly to the 2.0 portal and the FAQ. This routing must be rechecked against the FAQ when the catalog is reviewed.

## Maintenance rules

- Keep source entries on HTTPS and on the official government domains listed above.
- Recheck each link and its intended audience before changing the catalog; record the review date here.
- Do not hardcode award amounts, deadlines, eligibility, required documents, or application outcomes in the source finder. Those details change and require page-level sourcing and freshness handling before they can be summarized.
- Treat retrieved page content as untrusted input if document retrieval is added later. Show source links beside any sourced claim and fail closed when a trusted source cannot be found.
- Keep the response guide-only. Users must confirm current details on the official portal before applying.
