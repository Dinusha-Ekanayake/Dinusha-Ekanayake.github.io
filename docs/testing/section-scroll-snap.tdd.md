# Section scrolling TDD evidence

Section scroll snapping was removed to make scrolling smoother. The page now scrolls freely and stops wherever the visitor stops. Horizontal carousel snapping (certificates, project filters) is unchanged.

## Guarantees

| Guarantee | Test | Type | Result |
|---|---|---|---|
| Document-level vertical snapping is disabled | `tests/browser/hero-layout.e2e.cjs` | Browser E2E | PASS |
| Hero, section wrappers and footer are not snap targets | `tests/browser/hero-layout.e2e.cjs` | Browser E2E | PASS |
| Scrolling between sections stays where it stops | `tests/browser/hero-layout.e2e.cjs` | Interaction E2E | PASS |
| Scroll padding still clears the fixed navigation for anchor links | `tests/browser/hero-layout.e2e.cjs` | Layout E2E | PASS |
| Free scrolling introduces no horizontal overflow | `tests/browser/hero-layout.e2e.cjs` | Responsive E2E | PASS |
| Tall sections do not trap interior scrolling | `tests/browser/hero-layout.e2e.cjs` | Interaction E2E | PASS |
| Reduced-motion visitors avoid animated scrolling | `index.html` reduced-motion rule | Accessibility contract | PASS |

## Validation

```powershell
node tests/browser/hero-layout.e2e.cjs
```
