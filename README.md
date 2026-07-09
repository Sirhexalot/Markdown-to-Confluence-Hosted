# MD to DOC

VS Code extension to convert Markdown and Word files in both directions for Confluence and older Citrix workflows.

## What it does

- Converts Markdown to Word and Word back to Markdown.
- Supports the current file and selected files in the Explorer.
- Creates legacy `.doc` on macOS without LibreOffice by using a Word-compatible RTF export.
- Uses `pandoc` for `.docx` and Markdown conversion.
- Reads Confluence-style `.doc` exports that actually contain MHTML/HTML.

## Requirements

- `pandoc` installed
- On macOS no LibreOffice is required for `.doc`
- On Linux/Windows legacy `.doc` may still require an external converter

## Commands

- `MD to DOC: Convert Current File`
- `MD to DOC: Convert File`
- `DOC to MD: Convert Current File`
- `DOC to MD: Convert File`

## Settings

- `md2doc.pandocPath`: path to `pandoc`
- `md2doc.libreOfficePath`: optional explicit path to LibreOffice / `soffice`
- `md2doc.exportFormat`: `docx` or `doc`
- `md2doc.outputDirectory`: optional export directory
- `md2doc.openAfterExport`: open the exported file after conversion

## Notes

- `pandoc` is required for both directions.
- If VS Code cannot find `pandoc` via `PATH`, set `md2doc.pandocPath` to the full executable path.
- `.docx` works directly with `pandoc`.
- On macOS, legacy `.doc` is written as a Word-compatible RTF-backed document without LibreOffice.
- Some `.doc` files are not real binary Word files but MHTML exports; those are imported via their embedded HTML.
