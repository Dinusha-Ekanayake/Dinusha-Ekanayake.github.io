# Skills and tools icons — TDD evidence

## User journey

No plan file was supplied. As a portfolio visitor, I can scan the Skills & Tools section and identify each technology, platform, language, or capability through a compact icon paired with its readable name.

## RED → GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| Every skill chip receives one icon and preserves an accessible label | `tests/browser/skills-icons.e2e.cjs` | Browser and accessibility E2E | PASS | All 62 chips have one icon and matching `aria-label` |
| Every technology and capability uses a graphical SVG asset | `tests/browser/skills-icons.e2e.cjs` | Asset E2E | PASS | All 62 chips load local assets from `assets/icons/`; zero letter marks remain |
| Brand identities and conceptual capabilities stay visually recognizable | `tests/browser/skills-icons.e2e.cjs` | Visual E2E | PASS | Official brand icons are used where available and semantic SVGs cover model, reasoning, analysis, leadership, and problem-solving concepts |
| Updated tools appear only in their requested categories | `tests/browser/skills-icons.e2e.cjs` | Content E2E | PASS | Latest RED: expected 62 but received 60; GREEN: Streamlit is in Full-Stack & APIs and SQLite is in Data, Cloud & Deployment |
| Enhancement is safe to initialize more than once | `tests/browser/skills-icons.e2e.cjs` | Integration E2E | PASS | Calling `enhanceSkillTags()` twice still leaves exactly one icon per chip |
| Icons remain responsive in both themes | `tests/browser/skills-icons.e2e.cjs` | Visual E2E | PASS | No overflow at 1440 × 900, 768 × 900, or 375 × 812; dark and light themes verified |
| The page remains runtime-error free | `tests/browser/skills-icons.e2e.cjs` | Smoke E2E | PASS | No uncaught browser exceptions |

## Validation

```powershell
node --check tests/browser/skills-icons.e2e.cjs
node tests/browser/skills-icons.e2e.cjs
```

RED was captured with `desktop-dark: every skill must use a graphical icon asset instead of a letter mark`. GREEN reports 62 tags, 62 assets, zero marks, and zero overflow at every tested breakpoint.

This static single-file site has no instrumented coverage runner. The focused browser test exercises every rendered skill chip, all local icon assets, repeated initialization, theme switching, and three responsive widths. No checkpoint commits were created, leaving changes local for review.
