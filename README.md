# Dinusha Ekanayake — AI/ML Portfolio

A deploy-ready, single-page portfolio for an AI undergraduate and emerging AI/ML engineer. The experience is built with semantic HTML, modern CSS, and lightweight vanilla JavaScript—no build step required.

## Highlights

- Cinematic constellation hero with a pointer-responsive 3D AI technology cloud
- CV-aligned sections for profile, skills, education, projects, achievements, certifications, volunteering, and contact
- Applied-AI project filtering and interactive project detail modals
- Live neural-network backgrounds that react to pointer movement
- Dark and light themes with saved preference
- Responsive navigation and layouts for desktop, tablet, and mobile
- Reduced-motion support, keyboard navigation, focus states, and a skip link
- Local profile image, CV, and technology icons for reliable deployment

## Run locally

Open `index.html` directly, or serve the directory with any static server:

```bash
npx serve .
```

## Deploy to GitHub Pages

1. Push the repository to `Dinusha-Ekanayake.github.io`.
2. Open **Settings → Pages** in GitHub.
3. Choose **Deploy from a branch**, select the deployment branch, and use `/ (root)`.
4. The site will be available at `https://dinusha-ekanayake.github.io`.

The deploy bundle consists of:

```text
index.html
assets/
  Dinusha-Ekanayake-CV.pdf
  profile.jpg
  icons/
```

## Customize

- Portfolio content and interactions: `index.html`
- Color and typography tokens: the `:root` block in `index.html`
- Profile image: `assets/profile.jpg`
- Downloadable CV: `assets/Dinusha-Ekanayake-CV.pdf`
- Contact form delivery: replace `YOUR_FORM_ID` with a Formspree form ID; until then, the form opens the visitor’s email client.

## Validation

The portfolio is runtime-tested in Microsoft Edge for dynamic project, certification, volunteering, and 3D-logo initialization. JavaScript syntax and core HTML structure are also validated before deployment.
