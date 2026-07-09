# MD to DOC

VS Code extension for the current Confluence workflow: Confluence `.doc` export to Markdown and Markdown to Confluence `.wiki`.

## Current workflow

- Converts Confluence `.doc` exports back to Markdown.
- Converts Markdown to Confluence-style `.wiki` markup.
- Supports the current file and selected files in the Explorer.
- The incoming `.doc` files are always Confluence exports and are handled as MHTML/HTML-based documents.

## Commands

- `MD to Wiki Markup: Convert File`
- `DOC to MD: Convert Current File`
- `DOC to MD: Convert File`

The codebase still contains legacy `md2doc` code paths, but they are no longer part of the documented primary workflow.

## Dependencies

### npm package dependencies

This extension currently has no direct runtime `dependencies` in `package.json`.

Direct `devDependencies`:

- `@types/node`
- `@types/vscode`
- `@vscode/vsce`
- `markdownlint`
- `typescript`

### External tools

- `pandoc` is required for Confluence `.doc` export -> Markdown conversion.
- `.wiki` export does not require external tools.
- No additional external converter is required for the current documented workflow.

## Setup on a clean system

`npm install` does not install `pandoc`. It only installs the Node packages from `package.json`.

For development on a clean system:

1. Install Node.js and `pnpm`.
2. Run `pnpm install`.
3. Install `pandoc` separately if you want to use `DOC to MD`.
4. Run `pnpm build`.
5. Optionally run `pnpm package` to build the VSIX.

For using the built extension in VS Code:

- `MD to Wiki Markup` works without `pandoc`.
- `DOC to MD` needs `pandoc` installed and reachable via `PATH`, or configured via `md2doc.pandocPath`.
- The `.doc` input is expected to be a Confluence export, not a generic Word `.doc`.

## Settings

- `md2doc.pandocPath`: path to `pandoc`
- `md2doc.libreOfficePath`: optional explicit path to LibreOffice / `soffice`
- `md2doc.exportFormat`: `docx` or `doc`
- `md2doc.outputDirectory`: optional export directory
- `md2doc.openAfterExport`: open the exported file after conversion

## CLI regression entrypoints

- `pnpm test:md2doc -- <input.md> [--format doc|docx] [--output-dir <dir>] [--pandoc <path>] [--libreoffice <path>]`
- `pnpm test:doc2md -- <input.doc|input.docx> [--output-dir <dir>] [--pandoc <path>] [--libreoffice <path>]`
- `pnpm test:md2wiki -- <input.md> [--output-dir <dir>]`

`test:md2doc` is kept only as a legacy regression entrypoint.

## Notes

- If VS Code cannot find `pandoc` via `PATH`, set `md2doc.pandocPath` to the full executable path.
- In this workflow, the incoming `.doc` is always a Confluence export, not a normal binary Word `.doc`.
- These files are imported via their embedded HTML/MHTML content.
- The repository still contains legacy `md2doc` code paths, but they are not part of the current documented setup.
