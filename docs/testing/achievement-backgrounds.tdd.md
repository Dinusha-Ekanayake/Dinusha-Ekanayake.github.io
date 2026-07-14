# Achievement card backgrounds TDD evidence

## User journey

As a portfolio visitor, I see the supplied DataXplore team photo and G.C.E. A/L trophy photo as their respective achievement-card backgrounds while every achievement detail and resource link remains readable.

## RED to GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| The DataXplore card loads the supplied local team photograph | `tests/browser/achievements-background.e2e.cjs` | Asset and browser E2E | PASS | Initial RED: card was not configured as a photo achievement; GREEN: image loads from `assets/achievements/dataxplore-finalist.jpg` |
| The photograph behaves as a decorative background | `tests/browser/achievements-background.e2e.cjs` | Accessibility E2E | PASS | Empty alt text, `aria-hidden=true`, `object-fit: cover`, and one image instance |
| Text and links remain readable over the photograph | `tests/browser/achievements-background.e2e.cjs` | Theme E2E | PASS | Dark overlay token exists and title resolves to white in dark and light themes |
| The card index remains anchored at the top-right | `tests/browser/achievements-background.e2e.cjs` | Layout E2E | PASS | Second RED caught an inherited relative position; GREEN restores absolute positioning |
| The G.C.E. A/L card loads the supplied local trophy photograph | `tests/browser/achievements-background.e2e.cjs` | Asset and browser E2E | PASS | Academic-card RED: card lacked the photo configuration; GREEN: image loads from `assets/achievements/best-al-results.jpg` |
| The academic photo keeps a card-specific focal crop | `tests/browser/achievements-background.e2e.cjs` | Responsive visual E2E | PASS | `object-position: 50% 42%` keeps the college crest centered across 1440px, 768px, and 375px screenshots |
| Responsive layouts remain overflow-free | `tests/browser/achievements-background.e2e.cjs` | Responsive E2E | PASS | Verified at 1440px dark, 768px light, and 375px dark |

## Validation

```powershell
node tests/browser/achievements-background.e2e.cjs
node --check tests/browser/achievements-background.e2e.cjs
git diff --check
```

The focused browser test passed and its desktop, tablet, and mobile screenshots were manually inspected. Both photos load in every viewport, the academic crest remains visible, and no horizontal overflow appears. Pixel-level regression remains inconclusive because the repository has no committed screenshot baseline. The static site has no instrumented line-coverage runner.
