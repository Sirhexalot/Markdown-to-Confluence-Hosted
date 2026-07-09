# Confluence Markdown Bridge

Confluence Markdown Bridge is built for teams stuck with the on-prem Confluence wiki editor.

Instead of fighting the editor, you write and maintain your pages in Markdown, convert them to Confluence Wiki markup, and import them through `Insert > Markup`.

For existing pages, you can export the Confluence page as `.doc`, convert that export back to Markdown, make your changes locally, and convert the result back to Confluence Wiki markup for re-import.

The goal is simple: keep your real editing workflow in Markdown and use Confluence only as the publishing target.

## Why this extension exists

The on-prem Confluence editor can be slow, awkward, and frustrating for structured content.

This extension gives you a cleaner workflow:

- Write new pages in Markdown.
- Convert Markdown to Confluence Wiki markup.
- Paste the result into Confluence via `Insert > Markup`.
- Export existing Confluence pages as `.doc`.
- Convert those `.doc` exports back to Markdown.
- Edit the page comfortably in VS Code.
- Convert the updated Markdown back to Confluence Wiki markup and import it again.

No more editing large pages directly in the Confluence wiki editor.

## Core workflows

### 1. New page: Markdown to Confluence

1. Write your page in Markdown.
2. In VS Code, run `Markdown to Confluence Wiki: Convert File` or `Markdown to Confluence Wiki: Copy to Clipboard`.
3. If you exported to a file, open the generated `.wiki` file.
4. In Confluence, use `Insert > Markup`.
5. Select `Confluence Wiki`.
6. Paste the generated markup.

### 2. Existing page: Confluence export back to Markdown

1. Export the existing Confluence page as `.doc`.
2. In VS Code, run `Confluence DOC to Markdown: Convert File`.
3. Edit the generated Markdown file.
4. Run `Markdown to Confluence Wiki: Convert File`.
5. Re-import the generated `.wiki` file through `Insert > Markup`.

## What it converts

- Confluence `.doc` export -> Markdown
- Markdown -> Confluence Wiki markup

The `.doc` input is expected to be a Confluence export, not a generic Word document. These files are typically MHTML/HTML-backed exports and are handled accordingly.

## Commands

- `Markdown to Confluence Wiki: Convert File`
- `Markdown to Confluence Wiki: Copy to Clipboard`
- `Confluence DOC to Markdown: Convert Current File`
- `Confluence DOC to Markdown: Convert File`

Legacy `Markdown to DOC` command paths still exist in the codebase for regression purposes, but they are not the main documented workflow of this extension.

## Requirements

- `pandoc` is required for Confluence `.doc` export -> Markdown
- Markdown -> Confluence Wiki does not require `pandoc`

## Settings

- `md2doc.pandocPath`: path to `pandoc`
- `md2doc.libreOfficePath`: optional explicit path to LibreOffice / `soffice`
- `md2doc.exportFormat`: legacy `docx` or `doc` setting
- `md2doc.outputDirectory`: optional export directory
- `md2doc.openAfterExport`: open the exported file after conversion

## Notes for Confluence on-prem

- Markdown works well for headings, lists, links, images, blockquotes, fenced code blocks, tables, and common inline formatting.
- Tables are more reliable when converted to Confluence Wiki markup before import.
- Empty table cells are emitted in a Confluence-friendly way for on-prem import workflows.
- Raw HTML colors like `<span style="color:red">Text</span>` and `<u>underline</u>` are converted when they appear in the Markdown source.
- Confluence-specific macros and the full long tail of wiki syntax are intentionally not covered yet.

## Summary

Confluence Markdown Bridge lets you treat Markdown as your source of truth and Confluence on-prem as the final destination.

Write in Markdown. Convert when needed. Import into Confluence. Avoid the editor pain.
