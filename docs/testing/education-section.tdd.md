# Education section — TDD evidence

## User journey

No plan file was supplied. As a portfolio visitor, I can identify Dinusha's institutions from authentic visual marks, read both qualifications in a balanced layout, follow each logo to the institution website, and navigate directly to Education without the fixed navbar hiding its heading.

## RED → GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| Both education cards render the correct locally bundled institution logo | `tests/browser/education-section.e2e.cjs` | Asset and browser E2E | PASS | RED: University logo was missing; GREEN: both images are loaded at all three breakpoints |
| Logos have useful alternative text and link to official institution websites | `tests/browser/education-section.e2e.cjs` | Accessibility and link E2E | PASS | Both cards expose descriptive `alt` text and secure external links |
| Desktop cards have matching width, height, and top alignment | `tests/browser/education-section.e2e.cjs` | Responsive layout E2E | PASS | Equal geometry at 1440 × 900 with no overlap |
| Tablet and mobile cards stack in reading order without overlap | `tests/browser/education-section.e2e.cjs` | Responsive layout E2E | PASS | Verified at 768 × 900 and 375 × 812 |
| Direct Education navigation is not obscured by the fixed navbar | `tests/browser/education-section.e2e.cjs` | Navigation E2E | PASS | RED: desktop heading started behind navigation; GREEN: section scroll offset clears the navbar |
| Education stays stable in dark and light themes | `tests/browser/education-section.e2e.cjs` | Visual E2E | PASS | Desktop dark, tablet light, and mobile dark screenshots inspected |
| The section causes no horizontal overflow or runtime exceptions | `tests/browser/education-section.e2e.cjs` | Smoke E2E | PASS | No overflow or uncaught browser errors at any tested viewport |

## Asset provenance

- University of Moratuwa emblem: `https://uom.lk/assets/images/Uni_emblem.jpg`
- S. Thomas' College crest: the official Bandarawela site confirms it uses the parent-school crest; the transparent local copy was sourced from the indexed mirror at `clipartmax.com` after the official image host rejected scripted downloads.

## Validation

```powershell
node --check tests/browser/education-section.e2e.cjs
node tests/browser/education-section.e2e.cjs
git diff --check
```

This static single-file site has no instrumented coverage runner. The focused browser test covers both cards, images, links, accessible labels, anchor positioning, dark/light themes, responsive geometry, overflow, and runtime errors. No checkpoint commits were created, leaving the work local for review.
