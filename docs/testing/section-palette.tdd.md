# Shared hero palette TDD evidence

## User journey

As a portfolio visitor, I see the hero's gold, teal, coral, and neutral surface language continue through every section, so the site feels like one coherent visual system in dark and light themes.

## RED to GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| Shared hero glow tokens exist in both themes | `tests/browser/section-palette.e2e.cjs` | Browser E2E | PASS | Initial RED: `shared hero palette tokens are missing` |
| All eight major post-hero backgrounds contain gold, teal, and coral | `tests/browser/section-palette.e2e.cjs` | Theme E2E | PASS | Verified at desktop dark, tablet light, and mobile dark viewports |
| The post-hero atmosphere reuses the same palette as the hero | `tests/browser/section-palette.e2e.cjs` | CSS contract | PASS | Hero and post-hero computed backgrounds expose the active theme's three RGB channels |
| Mouse-responsive glows and the animated grid follow the active theme | `tests/browser/section-palette.e2e.cjs` | Theme E2E | PASS | Second RED: light-theme responsive glows retained dark RGB values; GREEN after theme-aware RGB tokens |
| Section labels stay within the hero accent palette | `tests/browser/section-palette.e2e.cjs` | Visual-system E2E | PASS | Every post-hero label resolves to active gold, teal, or coral |
| The unified backgrounds do not cause horizontal overflow | `tests/browser/section-palette.e2e.cjs` | Responsive E2E | PASS | No overflow at 1440px, 768px, or 375px |

## Validation

```powershell
node tests/browser/section-palette.e2e.cjs
node tests/browser/hero-layout.e2e.cjs
node tests/browser/education-section.e2e.cjs
node tests/browser/skills-icons.e2e.cjs
node tests/browser/footer-volunteering.e2e.cjs
```

All commands passed. Desktop-dark, tablet-light, and mobile-dark captures were manually inspected. Pixel-level regression remains inconclusive because the repository has no committed screenshot baseline.

The repository has no instrumented coverage runner, so line coverage is unavailable. No commit was created by Codex.
