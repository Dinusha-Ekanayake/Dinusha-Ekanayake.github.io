# Dinusha Ekanayake — Personal Portfolio

> Modern, minimal, Apple-inspired personal portfolio with dark/light mode, admin dashboard, and photography galleries.

## 🚀 Deploy to GitHub Pages in 5 Steps

1. **Create a new GitHub repo** named `Dinusha-Ekanayake.github.io`
   - Go to github.com → New repository
   - Name it exactly: `Dinusha-Ekanayake.github.io`
   - Set to Public

2. **Upload files**
   ```
   index.html          ← main portfolio file
   assets/
     cv.pdf            ← your CV/resume (rename to cv.pdf)
     profile.jpg       ← your profile photo
   ```

3. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: Deploy from a branch → `main` → `/ (root)`
   - Save

4. **Your site is live at:**
   `https://Dinusha-Ekanayake.github.io`

---

## 📁 Folder Structure

```
/
├── index.html          # The entire portfolio (self-contained)
└── assets/
    ├── cv.pdf          # Your downloadable CV
    └── profile.jpg     # Profile photo (for About section)
```

---

## 🔐 Admin Dashboard

Press **`Ctrl + Shift + A`** on your live site to open the dashboard.

**Default password:** `dinusha2024`

To change it: open `index.html` in a text editor, find the line:
```js
const PASS = 'dinusha2024';
```
Change it to any password you want.

### What you can manage:
| Section | Can Add | Can Delete |
|---------|---------|------------|
| Projects | ✅ | ✅ |
| Experience | ✅ | ✅ |
| Certifications & Awards | ✅ | ✅ |
| Photo Albums | ✅ | ✅ |
| Articles / Blog Posts | ✅ | ✅ |
| CV Link | ✅ | — |

> **Note:** Dashboard data is stored in your browser's localStorage. If you use a different browser/device, the data won't sync — but the site's default data (hardcoded in the HTML) always shows as fallback.

---

## 🌗 Dark / Light Mode

- Click the toggle button in the top-right nav
- Your preference is saved automatically across visits

---

## 📸 Adding Your Photos

For photo albums in the dashboard:
1. Upload images to any hosting (Imgur, Cloudinary, Google Photos public link, GitHub repo)
2. Open the dashboard → **Photo Albums** tab
3. Paste the image URL in "Cover image URL"

---

## 📄 Updating Your CV

**Option A — In your GitHub repo:**
- Go to your repo → Upload `assets/cv.pdf`
- The "Download CV" button works automatically

**Option B — Via Dashboard:**
- Press `Ctrl+Shift+A` → CV & Settings tab
- Paste a Google Drive direct link or any PDF URL

To get a Google Drive direct link:
1. Upload PDF to Google Drive
2. Right-click → Share → "Anyone with the link"
3. Copy link, then change `/view` to `/export?format=pdf` at the end

---

## ✏️ Customisation

Open `index.html` in any text editor (VS Code recommended).

**Change your name/bio:** Search for `Dinusha Ekanayake` — all instances are clearly labelled.

**Change accent colour:** Find `:root {` near the top, change `--accent: #1E5C42` to any colour.

**Add a custom domain:** In GitHub Pages settings, add your domain (e.g. `dinusha.dev`).

---

## 📬 Contact Form

The contact form opens the user's mail client with a pre-filled email to `dinushabawantha2003@gmail.com`.

To change: search for `dinushabawantha2003@gmail.com` in `index.html`.

---

Built with HTML · CSS · Vanilla JS · Google Fonts (Cormorant + DM Sans + JetBrains Mono)
