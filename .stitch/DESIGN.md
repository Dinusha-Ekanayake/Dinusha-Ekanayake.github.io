---
name: Dinusha Cinematic Portfolio
colors:
  background: '#060606'
  background-elevated: '#0e0e0e'
  background-inset: '#0a0a0a'
  surface: '#151515'
  surface-raised: '#1c1c1c'
  surface-high: '#222222'
  text-primary: '#f0ece2'
  text-secondary: '#9a9590'
  text-tertiary: '#5a5752'
  accent-gold: '#d4a853'
  accent-gold-bright: '#e8c47a'
  accent-teal: '#2ec4b6'
  accent-coral: '#e85d75'
  border-subtle: 'rgba(255, 255, 255, 0.07)'
  border-strong: 'rgba(255, 255, 255, 0.12)'
  light-background: '#faf8f4'
  light-surface: '#ffffff'
  light-text: '#141210'
typography:
  display-hero:
    fontFamily: Syne
    fontSize: 'clamp(3rem, 9vw, 8rem)'
    fontWeight: '700'
    lineHeight: '0.95'
    letterSpacing: '-0.02em'
  display-section:
    fontFamily: Syne
    fontSize: 'clamp(2rem, 5vw, 4rem)'
    fontWeight: '700'
    lineHeight: '1.05'
    letterSpacing: '-0.02em'
  headline-card:
    fontFamily: Syne
    fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)'
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: '-0.02em'
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '1.75'
    letterSpacing: '0'
  label-mono:
    fontFamily: Fira Code
    fontSize: '0.7rem'
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0.25em'
rounded:
  sm: '7px'
  md: '12px'
  card: '16px'
  button: '60px'
  full: '9999px'
spacing:
  unit: '4px'
  xs: '8px'
  sm: '16px'
  md: '24px'
  lg: '40px'
  xl: '64px'
  section: 'clamp(5rem, 10vw, 9rem)'
  gutter: 'clamp(1.5rem, 5vw, 5rem)'
---

# Design System: Dinusha Cinematic Portfolio

## 1. Visual Theme & Atmosphere

The portfolio uses a dark, cinematic visual language built around a near-black canvas, warm ivory typography, and three expressive identity accents: gold for ambition and exploration, teal for engineering and machine intelligence, and coral for photography and human creativity. Fine grain, blurred glows, constellation motion, and translucent navigation create depth without turning the interface into a conventional dashboard.

The mood is personal and editorial rather than corporate. Large Syne display typography establishes confidence, while compact Fira Code labels provide a technical counterpoint. Sections are generous and immersive, with individual background temperatures that separate chapters of the story. Enhancements should retain the multi-dimensional personality but make AI/ML the dominant narrative and keep photography, leadership, and exploration as credible differentiators.

## 2. Color Palette & Roles

### Primary Foundation

- **Cinematic Black — `#060606`:** primary page background, preloader, and deepest canvas.
- **Elevated Charcoal — `#0e0e0e`:** alternating section background and navigation depth.
- **Inset Black — `#0a0a0a`:** code-like fields, tags, and recessed content.
- **Graphite Surface — `#151515`:** cards, panels, forms, and timeline content.
- **Raised Graphite — `#1c1c1c`:** hover and nested surface hierarchy.

The light theme mirrors this hierarchy with **Warm Porcelain `#faf8f4`**, **Soft Linen `#f2efea`**, and white card surfaces. Light mode must remain warm rather than shifting to clinical blue-white.

### Accent & Interactive

- **Achievement Gold — `#d4a853`:** primary actions, selected states, section labels, statistics, and AI-career emphasis.
- **Bright Gold — `#e8c47a`:** primary-button hover and luminous highlights.
- **Intelligence Teal — `#2ec4b6`:** AI/ML skills, technical systems, active data, and engineering projects.
- **Story Coral — `#e85d75`:** photography, creative work, and human-centered highlights.

Use accents semantically. AI/ML and engineering should lean teal with gold as the overarching brand action; coral should remain confined to visual storytelling.

### Typography & Text Hierarchy

- **Warm Ivory — `#f0ece2`:** display headings, high-priority content, and active navigation.
- **Stone Gray — `#9a9590`:** body copy and supporting descriptions.
- **Muted Graphite — `#5a5752`:** metadata, inactive navigation, secondary labels, and decorative text.
- **Subtle Hairline — `rgba(255,255,255,.07)`:** quiet card separation.
- **Strong Hairline — `rgba(255,255,255,.12)`:** interactive boundaries and hover emphasis.

### Functional States

- **Success / Current:** Intelligence Teal with a soft transparent fill and restrained glow.
- **Primary / Selected:** Achievement Gold with black text for maximum contrast.
- **Creative / Media:** Story Coral with a low-opacity surface tint.
- **Focus:** a clear two-pixel gold or teal outline with offset; never rely on color alone.

## 3. Typography Rules

### Hierarchy & Weights

- **Syne** is the identity font. Use it for the hero name, section headlines, project titles, statistics, and prominent card titles. Its wide geometric character communicates contemporary creativity and confidence.
- **Plus Jakarta Sans** is the reading font. Use weights 300–700 for body copy, navigation, buttons, descriptions, and metadata where clarity matters.
- **Fira Code** is the technical voice. Use it sparingly for overlines, skill tags, dates, code fragments, live-state labels, and small section indices.
- Display headings use tight line-height and slightly negative tracking. Body text uses a relaxed `1.7–1.75` line-height and should remain between 55 and 75 characters per line.
- Uppercase mono labels use generous tracking; do not apply this treatment to paragraphs or longer controls.

### Spacing Principles

Text blocks follow a simple vertical rhythm: label to heading at 16–24px, heading to introduction at 20–28px, and paragraph-to-paragraph at 14–18px. Hero copy may be tighter to preserve visual drama. Section headings should always have generous breathing room before card grids.

## 4. Component Stylings

### Buttons

Primary buttons are gold pills with near-black text, approximately 48–50px tall, and generous horizontal padding. Hover lifts the button by 3px and introduces a warm ambient shadow. Secondary buttons remain transparent with a strong hairline border and warm-ivory text. All buttons need visible `:focus-visible` outlines and should not use motion as the only interaction feedback.

### Cards & Bento Containers

Cards use 16px rounded corners, one-pixel hairline borders, graphite surfaces, and blurred accent glows rather than persistent heavy shadows. Hover motion is restrained to 4–8px of vertical lift. Bento skill cards may span four, six, or eight columns on the 12-column desktop grid, collapsing to two columns and then one column at the existing breakpoints.

Project cards combine a graphic or data-led visual header with a text body. AI/ML projects should use small system diagrams, terminal fragments, charts, or model-pipeline motifs instead of emoji-only thumbnails. Project detail modals use the same surface and typography hierarchy as cards.

### Navigation

Navigation is a fixed translucent bar with 30px backdrop blur, subtle bottom border, compact uppercase links, and an animated underline. It shrinks from 72px to 56px on scroll. Mobile uses a hamburger-triggered vertical drawer below the bar. The theme toggle remains a compact pill control with a gold thumb.

### Inputs & Forms

Form controls use graphite surfaces, one-pixel borders, warm-ivory input text, and muted placeholder copy. Controls should be at least 44px tall, with 10–12px radii. Focus states should brighten the border to gold or teal and add a visible outline for accessibility.

### Identity, Timeline & Credential Components

Identity cards use one accent per discipline and support the personal story without competing with AI/ML. Timeline entries use a thin vertical line, small accent dots, mono dates, and strong Syne role titles. Credential cards should prioritize certificate name and issuer and include a direct credential action when available.

## 5. Layout Principles

### Grid & Structure

- Maximum content width: **1320px**.
- Page gutter: **`clamp(1.5rem, 5vw, 5rem)`**.
- Primary card system: **12-column CSS Grid** with 1.2rem gaps.
- Main breakpoints: **1024px**, **900px**, **768px**, and **500px**.
- The hero uses a 1.3 / 1 split on desktop and a single-column layout below 900px.

### Whitespace Strategy

Major sections use `clamp(5rem, 10vw, 9rem)` vertical padding. Card interiors range from 1.8rem to 2.2rem. The design should feel cinematic and spacious; compact density is appropriate only within technical tags, small statistics, or admin tooling.

### Alignment & Visual Balance

Body and project content are left-aligned. The hero balances oversized identity copy against a circular portrait system, and each section pairs a concise mono label with a strong display heading. Asymmetric bento spans and split layouts create rhythm while retaining a consistent content edge.

### Responsive Behavior & Touch

At 1024px, four-column identity grids become two columns and bento spans normalize. At 900px, the hero and split sections become single-column. At 768px, navigation becomes a drawer, cards collapse to one column, and touch targets must remain at least 44px. Motion-heavy pointer effects are disabled for touch devices, and all animations must respect `prefers-reduced-motion`.

## 6. Design System Notes for Stitch Generation

### Language to Use

Use phrases such as: “dark cinematic personal portfolio,” “warm editorial typography,” “technical constellation background,” “asymmetric bento grid,” “restrained glass navigation,” “data-led AI project cards,” and “gold, teal, and coral identity accents.” Avoid generic cyberpunk, neon gaming, sterile SaaS dashboard, and template-like résumé language.

### Color References

Anchor generated screens in Cinematic Black and Graphite Surface. Use Achievement Gold for primary actions, Intelligence Teal for AI/ML systems, and Story Coral only for photography or human creative work. Preserve Warm Ivory for all major headings.

### Component Prompts

1. “Create a fixed translucent portfolio navigation bar over a cinematic black background, with a compact DE monogram, uppercase warm-gray links, gold active underline, a résumé action, and a small light/dark toggle.”
2. “Create an AI-undergraduate hero using oversized Syne typography, a constellation canvas, a profile portrait with subtle orbit lines, a concise ML-focused value proposition, current-status chip, and two pill CTAs.”
3. “Create a responsive selected-project grid with one large predictive-maintenance case study and supporting cards for multi-agent research, AI résumé generation, semantic matching, and smart sensing; use data visualizations rather than stock illustrations.”

### Incremental Iteration

Preserve the foundational palette, type families, grain, and warm dark/light themes. Improve one layer at a time: first information hierarchy, then accurate CV content, then project visuals, then interaction polish. Do not replace the established personality with an unrelated UI kit.
