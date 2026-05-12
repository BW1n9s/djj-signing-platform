# DJJ Signing Platform

Static signing website exported from Claude Design and reorganized for easier maintenance.

## Structure

- `index.html` - production entry for the signing website.
- `src/app/` - signing app React JSX modules loaded by `index.html`.
- `src/wireframes/` - original wireframe/design canvas source and preview page.
- `assets/images/` - image assets.
- `assets/documents/` - reference PDFs from the original upload bundle.
- `archive/` - original single-file HTML export kept for reference.

## Run Locally

Serve the folder with any static web server, then open the local URL:

```powershell
python -m http.server 8000
```

The site depends on CDN-hosted React, Babel, jsPDF, html2canvas, and Google Fonts.
