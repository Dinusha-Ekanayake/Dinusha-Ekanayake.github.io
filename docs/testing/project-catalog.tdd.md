# Project catalog TDD evidence

## Source and user journey

No plan file was supplied. Project facts were read from the public repository READMEs on GitHub. The catalog covers PageTurn, CG Algorithm Visualizer, Algorithm Selection Expert System, and AI Prompt Quality Analyzer without inventing project scope.

As a portfolio visitor, I can discover nine projects in the carousel, isolate the three smaller builds under Mini Projects, inspect concise README-backed details, and open each requested GitHub repository.

## RED -> GREEN

| Guarantee | Test | Type | Result | Evidence |
|---|---|---|---|---|
| All requested work is present once in a nine-project catalog | `tests/browser/project-catalog.e2e.cjs` | Browser E2E | PASS | RED: `expected nine unique projects`; GREEN: nine unique projects |
| The three new builds have a dedicated Mini Projects filter | `tests/browser/project-catalog.e2e.cjs` | Browser E2E | PASS | Filtered readout is `01 / 03` and all three titles render |
| CG Algorithm Visualizer uses repository-backed scope and tools | `tests/browser/project-catalog.e2e.cjs` | Content E2E | PASS | Verifies step-by-step animation plus C++, OpenGL, GLFW, Dear ImGui, and CMake |
| Algorithm Selection Expert System uses repository-backed scope and tools | `tests/browser/project-catalog.e2e.cjs` | Content E2E | PASS | Verifies 36 algorithms plus SWI-Prolog, rule-based AI, and a dynamic knowledge base |
| AI Prompt Quality Analyzer uses repository-backed scope and tools | `tests/browser/project-catalog.e2e.cjs` | Content E2E | PASS | Verifies score out of 100 plus SWI-Prolog, rule-based AI, and scoring |
| Every modal opens its requested repository | `tests/browser/project-catalog.e2e.cjs` | Click-path E2E | PASS | Exact GitHub destinations are asserted for all four recently added projects |
| The expanded catalog is responsive | `tests/browser/project-catalog.e2e.cjs` | Visual and responsive E2E | PASS | No overflow at 1440px, 768px, or 375px; a different new modal was reviewed at each width |
| Returning visitors receive new projects without losing custom projects | `tests/browser/project-catalog.e2e.cjs` | Migration E2E | PASS | Legacy storage gains each required project once and preserves a custom project |

## Validation

```powershell
node tests/browser/project-catalog.e2e.cjs
```

The final run completed without runtime errors. This static single-file site has no instrumented coverage runner, so line coverage is not available; the focused E2E test covers every requested catalog behavior. No checkpoint commits were created, leaving the changes local for review.
