# Dinusha Ekanayake — My Portfolio

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Visit-D4A853?style=for-the-badge&logo=githubpages&logoColor=white)](https://dinusha-ekanayake.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-Dinusha--Ekanayake-181717?style=for-the-badge&logo=github)](https://github.com/Dinusha-Ekanayake)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Dinusha_Ekanayake-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/dinusha-ekanayake-0a0963266)

A cinematic, interactive portfolio for an Artificial Intelligence undergraduate at the University of Moratuwa. It presents AI/ML engineering, agentic AI, full-stack product development, education, projects, recognition, certifications, and leadership in one responsive experience.

The site is built with semantic HTML, modern CSS, and vanilla JavaScript. It has no framework, package installation, or production build step.

## Live site

**[dinusha-ekanayake.github.io](https://dinusha-ekanayake.github.io)**

## Highlights

- Pointer-responsive 3D technology sphere orbiting around the profile image
- Animated neural-network canvas and responsive ambient section backgrounds
- AI workflow presentation covering model development, agentic reasoning, deployment, and leadership
- Technical skills console with an animated technology marquee, icon-labelled tools, and categorized skill cards
- Filterable, circular project carousel with timed movement, center emphasis, navigation controls, and project detail modals
- Dynamic certification and leadership timelines
- Dark and light themes with browser-persisted preference
- Smooth section transitions, scroll reveals, parallax details, active navigation, and progress feedback
- Responsive desktop, tablet, and mobile layouts
- Reduced-motion support, visible focus styles, semantic landmarks, a skip link, and keyboard-operable project cards
- Search and social metadata for GitHub Pages sharing

## Portfolio sections

| Section | Content |
| --- | --- |
| Home | Introduction, professional focus, profile links, CV action, and interactive AI technology sphere |
| Approach | The four-stage workflow: Model, Reason, Deploy, and Lead |
| About | AI undergraduate profile and engineering interests |
| Skills | Machine learning, deep learning, LLMs, agents, software engineering, data, cloud, and product skills |
| Education | University of Moratuwa and G.C.E. Advanced Level background |
| Projects | Ten systems spanning predictive ML, agentic AI, full-stack products, frontend engineering, embedded sensing, symbolic AI, computer graphics, and this portfolio |
| Recognition | Competition and academic achievements |
| Certifications | Machine learning, cybersecurity, programming, web development, and data science learning |
| Leadership | University volunteering, web development, photography, and videography leadership |
| Contact | LinkedIn, GitHub, email, phone, and contact form |

## Technology

- **Structure:** HTML5
- **Styling:** CSS3, custom properties, responsive layouts, transforms, and keyframe animation
- **Interaction:** Vanilla JavaScript and the Canvas API
- **Persistence:** `localStorage` for theme and browser-local portfolio content
- **Typography:** Syne, Plus Jakarta Sans, and Fira Code through Google Fonts
- **Deployment:** GitHub Pages
- **Assets:** Local profile image and SVG technology icons

## Project structure

```text
Dinusha-Ekanayake.github.io/
├── index.html
├── README.md
├── LICENSE
└── assets/
    ├── Dinusha-Ekanayake-CV.pdf
    ├── profile.jpg
    └── icons/
        ├── fastapi.svg
        ├── huggingface.svg
        ├── nextjs.svg
        ├── numpy.svg
        ├── postgresql.svg
        ├── python.svg
        ├── pytorch.svg
        ├── react.svg
        ├── scikitlearn.svg
        └── tensorflow.svg
```

## Run locally

No installation is required. Clone the repository and serve it with any static file server.

```bash
git clone https://github.com/Dinusha-Ekanayake/Dinusha-Ekanayake.github.io.git
cd Dinusha-Ekanayake.github.io
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a browser.

You can also use Node.js:

```bash
npx serve .
```

Serving the directory is recommended over opening `index.html` directly because it more closely matches GitHub Pages behavior.

## Customize the portfolio

Most of the site is intentionally contained in [`index.html`](./index.html).

### Personal content

Update the semantic section markup for the hero, approach, about, skills, education, achievements, and contact information.

### Projects, certifications, and leadership

Edit these JavaScript collections in `index.html`:

- `D_PROJ` — project cards, filters, technologies, repository links, and modal content
- `D_CERT` — certification names and issuers
- `D_EXP` — volunteering and leadership timeline entries
- `D_ARTS` — optional article entries

These collections are the deployable source of truth. The page also supports browser-local changes through `localStorage`; those changes stay in that browser and are not written back to the repository.

### Design system

Edit the CSS custom properties in the `:root` and `[data-theme="light"]` blocks to change colors, surfaces, borders, shadows, and theme behavior.

### Images and icons

- Replace `assets/profile.jpg` with a new profile image while keeping the filename, or update its references.
- Add or replace technology icons in `assets/icons/` and update the logo-cloud and skills-marquee markup.
- Replace `assets/Dinusha-Ekanayake-CV.pdf` when publishing an updated CV, or change the CV path in `index.html`.

### Contact form

The form uses an email-client fallback by default. To send form submissions through Formspree, replace the placeholder in `index.html`:

```js
const FORMSPREE_ID = 'YOUR_FORM_ID';
```

Use only the Formspree form identifier here. Never commit API keys or private credentials to this public repository.

## Deploy to GitHub Pages

1. Push the site to the `Dinusha-Ekanayake.github.io` repository.
2. Open the repository's **Settings → Pages** page.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the deployment branch, normally `main`, and the `/ (root)` directory.
5. Save and wait for GitHub Pages to publish the site.

For a user-site repository with this name, the production URL is:

```text
https://dinusha-ekanayake.github.io
```

## Pre-deployment checklist

- Confirm the CV button opens and downloads the current PDF.
- Confirm the profile image, email address, phone number, GitHub link, and LinkedIn link.
- Replace generic project repository URLs with project-specific URLs when available.
- Configure Formspree if direct form delivery is required.
- Test the carousel, modals, mobile navigation, theme switcher, and contact flow.
- Check keyboard navigation and reduced-motion behavior.
- Test at common mobile, tablet, and desktop widths.
- Keep secrets and private keys out of `index.html` and Git history.

## License

This project is available under the [MIT License](./LICENSE).

---

Designed and engineered by **[Dinusha Ekanayake](https://github.com/Dinusha-Ekanayake)**.
