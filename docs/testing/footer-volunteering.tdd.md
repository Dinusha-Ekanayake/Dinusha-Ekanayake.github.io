# Merged footer and volunteering records — TDD evidence

## User journeys

No plan file was supplied.

- As a portfolio visitor, I see one unified Contact and footer experience without repeated social links, identity text, or copyright content.
- As a recruiter, I can find the Sasnaka Sansada Foundation and BDESA volunteer records exactly once and follow their supplied LinkedIn evidence links.
- As a mobile visitor, I can read and operate the footer without horizontal overflow or the fixed back-to-top control covering its sign-off.
- As a portfolio visitor, I still see the original large DINUSHA footer watermark behind the merged contact and sign-off content.

## RED → GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| Contact and the identity sign-off form one site-footer landmark | `tests/browser/footer-volunteering.e2e.cjs` | Semantic browser E2E | PASS | One `<footer>` contains `#contact` outside `<main>` at all tested sizes |
| GitHub, LinkedIn, email, and phone appear exactly once in the footer | `tests/browser/footer-volunteering.e2e.cjs` | Content E2E | PASS | Legacy repeated `.ft-links` removed; each action count is one |
| The owner name appears once in the merged footer | `tests/browser/footer-volunteering.e2e.cjs` | Content E2E | PASS | Sign-off keeps the identity once; copyright no longer repeats it |
| The original DINUSHA watermark remains a subtle footer background layer | `tests/browser/footer-volunteering.e2e.cjs` | Visual and semantic E2E | PASS | RED: watermark missing; GREEN: exactly one low-opacity, pointer-inert, `aria-hidden` background word at all three viewports |
| Sasnaka Sansada Foundation appears once with the supplied period and link | `tests/browser/footer-volunteering.e2e.cjs` | Data and link E2E | PASS | RED: record missing; GREEN: one `2023 — 2024` record with secure LinkedIn link |
| BDESA appears once with the complete supplied role and link | `tests/browser/footer-volunteering.e2e.cjs` | Data and link E2E | PASS | Seed and saved experience data are deduplicated by role and organization |
| Footer and volunteering remain responsive in both themes | `tests/browser/footer-volunteering.e2e.cjs` | Visual E2E | PASS | Desktop dark, tablet light, and mobile dark screenshots inspected |
| Back-to-top control does not cover the sign-off | `tests/browser/footer-volunteering.e2e.cjs` | Responsive geometry E2E | PASS | RED: tablet collision detected; GREEN: footer safe area prevents overlap |
| No overflow or browser runtime errors occur | `tests/browser/footer-volunteering.e2e.cjs` | Smoke E2E | PASS | Three viewports pass with zero horizontal overflow and zero uncaught exceptions |

## Validation

```powershell
node --check tests/browser/footer-volunteering.e2e.cjs
node tests/browser/footer-volunteering.e2e.cjs
git diff --check
```

This static single-file site has no instrumented coverage runner. The focused test covers the merged landmark, unique actions, persisted-data deduplication, both new records, external-link safety, responsive geometry, themes, overflow, and runtime errors. No checkpoint commits were created, leaving changes local for review.
