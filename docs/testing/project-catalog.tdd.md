# Project catalog TDD evidence

## Source and user journey

No plan file was supplied. Project facts and visual assets were read from the public GitHub repositories and the portfolio's local README. Seven cards use locally stored GitHub social previews, the two Prolog cards use project-authored README screenshots, and the portfolio card uses an optimized capture of the site itself.

As a portfolio visitor, I can discover ten projects in the carousel, recognize each through an authentic project image, isolate the portfolio under Frontend and the three smaller builds under Mini Projects, inspect concise README-backed details, and open each requested repository or live demo.

## RED -> GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| All requested work is present once in a ten-project catalog | `tests/browser/project-catalog.e2e.cjs` | Browser E2E | PASS | RED: `AI/ML Engineering Portfolio: banner asset is missing`; GREEN: ten unique projects |
| The portfolio is classified and linked correctly | `tests/browser/project-catalog.e2e.cjs` | Content and click-path E2E | PASS | Frontend is `01 / 01`; repository and live-demo links both render in the modal |
| The three new builds have a dedicated Mini Projects filter | `tests/browser/project-catalog.e2e.cjs` | Browser E2E | PASS | Filtered readout is `01 / 03` and all three titles render |
| CG Algorithm Visualizer uses repository-backed scope and tools | `tests/browser/project-catalog.e2e.cjs` | Content E2E | PASS | Verifies step-by-step animation plus C++, OpenGL, GLFW, Dear ImGui, and CMake |
| Algorithm Selection Expert System uses repository-backed scope and tools | `tests/browser/project-catalog.e2e.cjs` | Content E2E | PASS | Verifies 36 algorithms plus SWI-Prolog, rule-based AI, and a dynamic knowledge base |
| AI Prompt Quality Analyzer uses repository-backed scope and tools | `tests/browser/project-catalog.e2e.cjs` | Content E2E | PASS | Verifies score out of 100 plus SWI-Prolog, rule-based AI, and scoring |
| Every modal opens its requested repository | `tests/browser/project-catalog.e2e.cjs` | Click-path E2E | PASS | Exact GitHub destinations are asserted for all recently added projects, plus the portfolio live demo |
| Every project card loads its local project image | `tests/browser/project-catalog.e2e.cjs` | Asset and browser E2E | PASS | All ten files exist, exceed 10 KB, decode, and render |
| Project modals display an accessible version of the same image | `tests/browser/project-catalog.e2e.cjs` | Browser E2E | PASS | Modal image loads and its alternative text matches the project title |
| The expanded catalog is responsive | `tests/browser/project-catalog.e2e.cjs` | Visual and responsive E2E | PASS | No overflow at 1440px, 768px, or 375px; a different new modal was reviewed at each width |
| Returning visitors receive new projects and banners without losing custom projects | `tests/browser/project-catalog.e2e.cjs` | Migration E2E | PASS | Legacy storage gains each required project once, refreshes all canonical banner paths, and preserves a custom project |

## Validation

```powershell
node tests/browser/project-catalog.e2e.cjs
```

The final run completed without runtime errors. This static single-file site has no instrumented coverage runner, so line coverage is not available; the focused E2E test covers every requested catalog behavior. No checkpoint commits were created, leaving the changes local for review.
