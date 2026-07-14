# Hero layout and live GitHub statistics

## User journey

The portfolio visitor sees a balanced hero at desktop, tablet, and mobile sizes. The primary actions and social links share a consistent control height, the GitHub and LinkedIn controls match each other, and the statistics appear in this order:

1. AI Journey Began
2. GitHub Commits
3. Featured Systems
4. Repositories

GitHub commits and public repositories refresh from GitHub without exposing a token. The last successful response is cached for six hours and remains visible if a later refresh is offline.

## Red to green

- Red: `node tests/browser/hero-layout.e2e.cjs` failed because the live GitHub statistics functions did not exist.
- Green: the same command passes after adding the two-request refresh, cache fallback, responsive alignment, and equal-sized hero controls.

## Automated guarantees

The browser test verifies:

- exactly two GitHub requests and the expected user/search endpoints;
- successful live rendering and cached offline fallback;
- exact statistic labels, order, and dynamic featured-project count;
- equal control heights and equal GitHub/LinkedIn widths;
- no horizontal overflow at 1440 x 900, 768 x 900, and 375 x 812;
- desktop column centering and no content/stat overlap;
- full-hero screenshots at every tested breakpoint.

## Commands

```powershell
node --check tests/browser/hero-layout.e2e.cjs
node tests/browser/hero-layout.e2e.cjs
```

No project-wide coverage runner is configured for this single-file static site, so verification uses the focused browser journey and runtime exception capture.
