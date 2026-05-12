# DJJ Signing Platform

Static signing website exported from Claude Design and reorganized for easier maintenance.

## Structure

- `DJJ-Signing-App.html` - official standalone signing app.
- `index.html` - lightweight redirect to `DJJ-Signing-App.html` for static hosts.
- `src/app/` - readable app source modules from the export, kept for future edits.
- `archive/claude-design-preview/` - Claude Design wireframe/preview files.
- `archive/reference-documents/` - PDF references from the original upload bundle; duplicate copies are separated under `duplicates/`.
- `archive/reference-assets/` - unused reference assets from the original bundle.

## Run Locally

Serve the folder with any static web server, then open the local URL:

```powershell
python -m http.server 8000
```

The site depends on CDN-hosted React, Babel, jsPDF, html2canvas, and Google Fonts.
