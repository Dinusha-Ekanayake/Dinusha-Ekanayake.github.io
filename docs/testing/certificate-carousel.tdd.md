# Certificate carousel TDD evidence

## User journey

As a portfolio visitor, I can browse every certificate in a discrete, automatically advancing horizontal carousel without expanding the page downward, so I can scan credentials without losing my place in the section.

## RED → GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| The certificate area is a single horizontal row with Previous and Next controls | `tests/browser/certificate-carousel.e2e.cjs` | Browser E2E | PASS | Initial RED: `carousel controls are missing`; final run: 16 cards in one row |
| Next reveals the following card and updates the visible range | `tests/browser/certificate-carousel.e2e.cjs` | Browser E2E | PASS | Desktop `1–3` → `2–4`; tablet `1–2` → `2–3`; mobile `1` → `2` |
| Category filters reset the track and disable navigation for one result | `tests/browser/certificate-carousel.e2e.cjs` | Browser E2E | PASS | Cybersecurity filter returns one card at scroll position zero |
| ArrowRight keyboard navigation advances the carousel | `tests/browser/certificate-carousel.e2e.cjs` | Browser E2E | PASS | Verified at 1440px, 768px, and 375px |
| The page does not gain horizontal overflow | `tests/browser/certificate-carousel.e2e.cjs` | Responsive E2E | PASS | Verified at all three breakpoints |
| Autoplay advances one card after a fixed interval, can be paused, and loops at the end | `tests/browser/certificate-carousel.e2e.cjs` | Timed browser E2E | PASS | RED: autoplay control missing; GREEN: movement after 4 seconds, stable while paused, final position wraps to zero |

## Validation

```powershell
node tests/browser/certificate-carousel.e2e.cjs
```

The final run completed with zero runtime and console errors. The repository has no instrumented coverage runner, so line coverage is not available; the focused E2E test covers every requested carousel behavior. Visual captures were reviewed in dark desktop and light tablet/mobile themes. Pixel-level regression comparison is inconclusive because no baseline screenshots are committed.

No checkpoint commits were created; changes remain local for review.
