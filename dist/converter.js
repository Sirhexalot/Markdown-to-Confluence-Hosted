"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMarkdownFile = convertMarkdownFile;
exports.convertWordFile = convertWordFile;
const fs = __importStar(require("node:fs/promises"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
async function convertMarkdownFile(inputPath, options = {}) {
    if (path.extname(inputPath).toLowerCase() !== ".md") {
        throw new Error("Please select a Markdown file.");
    }
    const pandocCommand = await resolvePandocCommand(options.pandocPath?.trim() ?? "pandoc");
    const libreOfficePath = options.libreOfficePath?.trim() ?? "";
    const exportFormat = options.exportFormat ?? "doc";
    const inputDirectory = path.dirname(inputPath);
    const inputBaseName = path.basename(inputPath, ".md");
    const outputDirectory = resolveOutputDirectory(inputDirectory, options.outputDirectory?.trim() ?? "");
    const outputPath = path.join(outputDirectory, `${inputBaseName}.${exportFormat}`);
    await fs.mkdir(outputDirectory, { recursive: true });
    const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "md2doc-"));
    try {
        if (exportFormat === "docx") {
            await runCommand(pandocCommand, ["-f", "gfm", inputPath, "-o", outputPath]);
        }
        else {
            await exportLegacyDoc(pandocCommand, inputPath, outputPath, tempDirectory, libreOfficePath);
        }
        return outputPath;
    }
    finally {
        await fs.rm(tempDirectory, { recursive: true, force: true });
    }
}
async function convertWordFile(inputPath, options = {}) {
    const extension = path.extname(inputPath).toLowerCase();
    if (![".doc", ".docx"].includes(extension)) {
        throw new Error("Please select a .doc or .docx file.");
    }
    const pandocCommand = await resolvePandocCommand(options.pandocPath?.trim() ?? "pandoc");
    const libreOfficePath = options.libreOfficePath?.trim() ?? "";
    const inputDirectory = path.dirname(inputPath);
    const inputBaseName = path.basename(inputPath, extension);
    const outputDirectory = resolveOutputDirectory(inputDirectory, options.outputDirectory?.trim() ?? "");
    const outputPath = path.join(outputDirectory, `${inputBaseName}.md`);
    await fs.mkdir(outputDirectory, { recursive: true });
    const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "md2doc-"));
    try {
        if (extension === ".docx") {
            await convertPandocDocumentToMarkdown(pandocCommand, "docx", inputPath, outputPath);
        }
        else {
            await importLegacyDocToMarkdown(pandocCommand, inputPath, outputPath, tempDirectory, libreOfficePath);
        }
        return outputPath;
    }
    finally {
        await fs.rm(tempDirectory, { recursive: true, force: true });
    }
}
function resolveOutputDirectory(inputDirectory, outputDirectorySetting) {
    if (!outputDirectorySetting) {
        return inputDirectory;
    }
    return path.isAbsolute(outputDirectorySetting)
        ? outputDirectorySetting
        : path.join(inputDirectory, outputDirectorySetting);
}
async function exportLegacyDoc(pandocCommand, inputPath, outputPath, workingDirectory, configuredLibreOfficePath) {
    if (process.platform === "darwin") {
        const textutilCommand = await resolveTextutilCommand();
        const tempDocxPath = path.join(workingDirectory, `${path.basename(outputPath, ".doc")}.docx`);
        await runCommand(pandocCommand, ["-f", "gfm", inputPath, "-o", tempDocxPath]);
        await runCommand(textutilCommand, ["-convert", "doc", "-output", outputPath, tempDocxPath]);
        return;
    }
    const tempDocxPath = path.join(workingDirectory, `${path.basename(outputPath, ".doc")}.docx`);
    await runCommand(pandocCommand, ["-f", "gfm", inputPath, "-o", tempDocxPath]);
    const converter = await resolveDocConverter(configuredLibreOfficePath);
    if (!converter) {
        throw new Error("Legacy .doc export requires macOS textutil or LibreOffice/soffice. On this system, use docx or install a converter.");
    }
    await runCommand(converter, [
        "--headless",
        "--convert-to",
        "doc:MS Word 97",
        "--outdir",
        workingDirectory,
        tempDocxPath
    ]);
    const convertedPath = path.join(workingDirectory, `${path.basename(tempDocxPath, ".docx")}.doc`);
    await fs.copyFile(convertedPath, outputPath);
}
async function importLegacyDocToMarkdown(pandocCommand, inputPath, outputPath, workingDirectory, configuredLibreOfficePath) {
    const htmlCandidate = await extractHtmlFromMhtmlDoc(inputPath, workingDirectory);
    if (htmlCandidate) {
        await convertPandocDocumentToMarkdown(pandocCommand, "html", htmlCandidate, outputPath);
        return;
    }
    if (await isRtfBackedDoc(inputPath)) {
        await convertPandocDocumentToMarkdown(pandocCommand, "rtf", inputPath, outputPath);
        return;
    }
    if (process.platform === "darwin") {
        const textutilCommand = await resolveTextutilCommand();
        const tempDocxPath = path.join(workingDirectory, `${path.basename(inputPath, ".doc")}.docx`);
        await runCommand(textutilCommand, ["-convert", "docx", "-output", tempDocxPath, inputPath]);
        await convertPandocDocumentToMarkdown(pandocCommand, "docx", tempDocxPath, outputPath);
        return;
    }
    const tempDocxPath = await convertDocToDocx(inputPath, workingDirectory, configuredLibreOfficePath);
    await convertPandocDocumentToMarkdown(pandocCommand, "docx", tempDocxPath, outputPath);
}
async function convertDocToDocx(inputPath, workingDirectory, configuredLibreOfficePath) {
    const converter = await resolveDocConverter(configuredLibreOfficePath);
    if (!converter) {
        throw new Error("Importing legacy .doc requires LibreOffice or soffice. Install it or convert the file to .docx first.");
    }
    await runCommand(converter, [
        "--headless",
        "--convert-to",
        "docx",
        "--outdir",
        workingDirectory,
        inputPath
    ]);
    return path.join(workingDirectory, `${path.basename(inputPath, ".doc")}.docx`);
}
async function extractHtmlFromMhtmlDoc(inputPath, workingDirectory) {
    const rawContent = await fs.readFile(inputPath, "utf8").catch(() => undefined);
    if (!rawContent || !rawContent.includes("Content-Transfer-Encoding: quoted-printable")) {
        return undefined;
    }
    const htmlMatch = rawContent.match(/Content-Type:\s*text\/html[\s\S]*?Content-Transfer-Encoding:\s*quoted-printable[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n--[-=_A-Za-z0-9.]+--?|\s*$)/);
    if (!htmlMatch) {
        return undefined;
    }
    const decodedHtml = sanitizeConfluenceHtml(decodeQuotedPrintable(htmlMatch[1]).trim());
    if (!decodedHtml.toLowerCase().includes("<html")) {
        return undefined;
    }
    const htmlPath = path.join(workingDirectory, `${path.basename(inputPath, ".doc")}.html`);
    await fs.writeFile(htmlPath, decodedHtml, "utf8");
    return htmlPath;
}
function decodeQuotedPrintable(input) {
    const normalized = input.replace(/=\r?\n/g, "");
    const bytes = [];
    for (let index = 0; index < normalized.length; index += 1) {
        const current = normalized[index];
        const hex = normalized.slice(index + 1, index + 3);
        if (current === "=" && /^[0-9A-F]{2}$/i.test(hex)) {
            bytes.push(Number.parseInt(hex, 16));
            index += 2;
            continue;
        }
        bytes.push(normalized.charCodeAt(index));
    }
    return Buffer.from(bytes).toString("utf8");
}
function sanitizeConfluenceHtml(input) {
    return input
        .replace(/(<a\b[^>]*class="[^"]*\bconfluence-userlink\b[^"]*"[^>]*>[\s\S]*?<\/a>)(?=\S)/gi, "$1 ")
        .replace(/<a\b[^>]*class="[^"]*\bconfluence-userlink\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, (_, text) => stripHtmlTags(text).replace(/\s+/g, " ").trim())
        .replace(/<\/?(?:div|span)\b[^>]*>/gi, "")
        .replace(/<colgroup\b[\s\S]*?<\/colgroup>/gi, "")
        .replace(/<col\b[^>]*\/?>/gi, "")
        .replace(/\s(?:class|style|id|scope|data-[\w-]+)="[^"]*"/gi, "")
        .replace(/<strong>\s*<br\s*\/?>\s*<\/strong>/gi, "")
        .replace(/<(td|th)>\s*<ul>\s*<li>([\s\S]*?)<\/li>\s*<\/ul>\s*<\/\1>/gi, "<$1>$2</$1>")
        .replace(/<(td|th)>\s*<p>([\s\S]*?)<\/p>\s*<\/\1>/gi, "<$1>$2</$1>")
        .replace(/<(td|th)>\s*<br\s*\/?>\s*<\/\1>/gi, "<$1></$1>")
        .replace(/&#10;/gi, "\n")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+([.,;:!?])/g, "$1");
}
function stripHtmlTags(input) {
    return input.replace(/<[^>]+>/g, "");
}
async function convertPandocDocumentToMarkdown(pandocCommand, inputFormat, inputPath, outputPath) {
    const rawMarkdown = await runCommandForStdout(pandocCommand, [
        "-f",
        inputFormat,
        "-t",
        "gfm",
        "--wrap=none",
        inputPath
    ]);
    await fs.writeFile(outputPath, normalizeGeneratedMarkdown(rawMarkdown), "utf8");
}
function normalizeGeneratedMarkdown(input) {
    return normalizeMarkdownTables(convertHtmlTablesToMarkdown(input)
        .replace(/\r\n/g, "\n")
        .replace(/^\s*•\s+/gm, "- ")
        .replace(/[ \t]*\\[ \t]*(?=\n)/g, "")
        .replace(/^[ \t]*\\[ \t]*$/gm, "")
        .replace(/<\/?u>/gi, "")
        .replace(/\*\*\s+([.,;:!?])/g, "**$1")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trimEnd()
        .concat("\n"));
}
function convertHtmlTablesToMarkdown(input) {
    return input.replace(/<table\b[\s\S]*?<\/table>/gi, (tableHtml) => htmlTableToMarkdown(tableHtml) ?? tableHtml);
}
function htmlTableToMarkdown(tableHtml) {
    const rowMatches = [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
    if (rowMatches.length === 0) {
        return undefined;
    }
    const rows = rowMatches
        .map((rowMatch) => {
        const rowHtml = rowMatch[1];
        const cellMatches = [...rowHtml.matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
        if (cellMatches.length === 0) {
            return undefined;
        }
        return {
            isHeader: cellMatches.some((cellMatch) => cellMatch[1].toLowerCase() === "th"),
            cells: cellMatches.map((cellMatch) => normalizeHtmlTableCell(cellMatch[2]))
        };
    })
        .filter((row) => Boolean(row));
    if (rows.length === 0) {
        return undefined;
    }
    const columnCount = Math.max(...rows.map((row) => row.cells.length));
    const paddedRows = rows.map((row) => ({
        ...row,
        cells: [...row.cells, ...Array.from({ length: Math.max(0, columnCount - row.cells.length) }, () => "")]
    }));
    const headerRow = paddedRows.find((row) => row.isHeader) ?? paddedRows[0];
    const bodyRows = paddedRows.filter((row) => row !== headerRow);
    const lines = [
        renderMarkdownTableRow(headerRow.cells),
        renderMarkdownTableRow(Array.from({ length: columnCount }, () => "---")),
        ...bodyRows.map((row) => renderMarkdownTableRow(row.cells))
    ];
    return lines.join("\n");
}
function normalizeHtmlTableCell(input) {
    const listNormalized = input
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>\s*<p\b[^>]*>/gi, "\n\n")
        .replace(/<(ul|ol)\b[^>]*>\s*([\s\S]*?)<\/\1>/gi, (_match, listType, listBody) => {
        const items = [...listBody.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((itemMatch) => decodeBasicHtmlEntities(stripHtmlTags(itemMatch[1])).replace(/\s+/g, " ").trim());
        if (items.length === 0) {
            return "";
        }
        return items
            .map((item, index) => `${listType.toLowerCase() === "ol" ? `${index + 1}.` : "-"} ${item}`)
            .join("\n");
    });
    return decodeBasicHtmlEntities(stripHtmlTags(listNormalized))
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .split("\n")
        .map((line) => line.trim())
        .filter((line, index, lines) => line.length > 0 || (index > 0 && lines[index - 1].length > 0))
        .join("<br>")
        .replace(/:(?=- )/g, ":<br>")
        .replace(/\|/g, "\\|")
        .trim();
}
function renderMarkdownTableRow(cells) {
    return `|${cells.join("|")}|`;
}
function decodeBasicHtmlEntities(input) {
    return input
        .replace(/&#10;/gi, "\n")
        .replace(/&#39;/gi, "'")
        .replace(/&quot;/gi, "\"")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&nbsp;/gi, " ");
}
async function isRtfBackedDoc(inputPath) {
    const rawContent = await fs.readFile(inputPath, "utf8").catch(() => undefined);
    if (!rawContent) {
        return false;
    }
    const trimmedStart = rawContent.trimStart();
    return /^\{\\(?:rtf|pard)\b/.test(trimmedStart);
}
function normalizeMarkdownTables(input) {
    const lines = input.split("\n");
    const normalized = [];
    for (let index = 0; index < lines.length;) {
        if (!isMarkdownTableLine(lines[index])) {
            normalized.push(lines[index]);
            index += 1;
            continue;
        }
        const tableLines = [];
        while (index < lines.length && isMarkdownTableLine(lines[index])) {
            tableLines.push(lines[index]);
            index += 1;
        }
        normalized.push(...normalizeMarkdownTableBlock(tableLines));
    }
    return normalized.join("\n");
}
function isMarkdownTableLine(line) {
    return /^\|.*\|\s*$/.test(line);
}
function normalizeMarkdownTableBlock(lines) {
    if (lines.length < 3) {
        return lines;
    }
    const parsedRows = lines.map(parseMarkdownTableRow);
    const [firstRow, secondRow, thirdRow] = parsedRows;
    if (firstRow.every((cell) => cell.length === 0) &&
        isMarkdownSeparatorRow(secondRow) &&
        thirdRow.some((cell) => cell.length > 0)) {
        const columnCount = thirdRow.length;
        return [
            renderMarkdownTableRow(thirdRow),
            renderMarkdownTableRow(Array.from({ length: columnCount }, () => "---")),
            ...parsedRows.slice(3).map(renderMarkdownTableRow)
        ];
    }
    return lines;
}
function parseMarkdownTableRow(line) {
    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
}
function isMarkdownSeparatorRow(cells) {
    return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}
async function resolvePandocCommand(configuredPandocPath) {
    const configured = configuredPandocPath || "pandoc";
    const candidates = configured === "pandoc"
        ? [configured, ...getDefaultPandocCandidates()]
        : [configured];
    for (const candidate of candidates) {
        try {
            await runCommand(candidate, ["--version"]);
            return candidate;
        }
        catch {
            continue;
        }
    }
    throw new Error("Pandoc was not found. Install pandoc or set md2doc.pandocPath to the full executable path.");
}
async function resolveDocConverter(configuredLibreOfficePath) {
    const configured = configuredLibreOfficePath.trim();
    const candidates = configured ? [configured] : getDefaultLibreOfficeCandidates();
    for (const candidate of candidates) {
        try {
            await runCommand(candidate, ["--version"]);
            return candidate;
        }
        catch {
            continue;
        }
    }
    return undefined;
}
async function resolveTextutilCommand() {
    if (process.platform !== "darwin") {
        throw new Error("textutil is only available on macOS.");
    }
    const candidate = "/usr/bin/textutil";
    await runCommand(candidate, ["-help"]);
    return candidate;
}
function getDefaultPandocCandidates() {
    const homeDirectory = os.homedir();
    if (process.platform === "win32") {
        return [
            "pandoc.exe",
            "C:\\Program Files\\Pandoc\\pandoc.exe",
            "C:\\Program Files (x86)\\Pandoc\\pandoc.exe"
        ];
    }
    return [
        "/opt/homebrew/bin/pandoc",
        "/usr/local/bin/pandoc",
        "/usr/bin/pandoc",
        path.join(homeDirectory, ".local", "bin", "pandoc")
    ];
}
function getDefaultLibreOfficeCandidates() {
    if (process.platform === "win32") {
        return [
            "soffice.exe",
            "libreoffice.exe",
            "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
            "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"
        ];
    }
    if (process.platform === "darwin") {
        return [
            "soffice",
            "libreoffice",
            "/Applications/LibreOffice.app/Contents/MacOS/soffice",
            "/opt/homebrew/bin/soffice",
            "/usr/local/bin/soffice"
        ];
    }
    return [
        "soffice",
        "libreoffice",
        "/usr/bin/soffice",
        "/usr/local/bin/soffice"
    ];
}
async function runCommand(command, args) {
    await execFileAsync(command, args);
}
async function runCommandForStdout(command, args) {
    const { stdout } = await execFileAsync(command, args);
    return stdout;
}
//# sourceMappingURL=converter.js.map