# Takieddine Drici — Portfolio & CV

Personal portfolio + CV website for **Takieddine Drici**, Social Media & Community Manager | Content & Automation Specialist.

## Live site
https://dricitakieddine.github.io/Portfolio/

## File structure
```
index.html          # Single-page site
style.css           # All styles (black / red / white palette)
script.js           # GSAP animations, cursor, nav, contact form, project modal
assets/
  photo.png         # your logo / favicon / hero portrait (add yourself)
  Takieddine_Drici_CV.pdf   # CV download
.github/workflows/pages.yml # GitHub Pages deploy
```

## Before you go live
1. Add your assets to `assets/`:
   - `assets/photo.png` — square image used as logo, favicon, and hero portrait
   - `assets/Takieddine_Drici_CV.pdf` — your CV PDF
2. Replace project thumbnails: swap each SVG `project__thumb--workflow` for a real screenshot `<img src="assets/project-NAME.jpg" loading="lazy">` inside `.project__thumb-wrap`.
3. Update `window.SITE_URL` in `index.html` if your GitHub Pages URL changes.
4. Commit and push to `main`, then GitHub Actions deploys to Pages.

## Deploy to GitHub Pages
```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
gh repo create taki-portfolio --public --source=. --remote=origin --push
gh api -X POST repos/dricitakieddine/taki-portfolio/pages -f build_type=workflow
gh run watch
```
Site goes live at `https://dricitakieddine.github.io/taki-portfolio/`.

## Tech
Plain HTML + CSS + vanilla JS. No build step. GSAP + ScrollTrigger loaded from CDN. Dark-only theme.
