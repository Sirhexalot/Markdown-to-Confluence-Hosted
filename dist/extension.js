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
exports.activate = activate;
exports.deactivate = deactivate;
const path = __importStar(require("node:path"));
const vscode = __importStar(require("vscode"));
const converter_1 = require("./converter");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("md2doc.convertCurrentFile", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }
        await convertMarkdownToWord(editor.document.uri);
    }), vscode.commands.registerCommand("md2doc.convertFile", async (resource) => {
        const target = resource ?? vscode.window.activeTextEditor?.document.uri;
        if (!target) {
            vscode.window.showErrorMessage("No Markdown file selected.");
            return;
        }
        await convertMarkdownToWord(target);
    }), vscode.commands.registerCommand("md2doc.convertMarkdownToWikiFile", async (resource) => {
        const target = resource ?? vscode.window.activeTextEditor?.document.uri;
        if (!target) {
            vscode.window.showErrorMessage("No Markdown file selected.");
            return;
        }
        await convertMarkdownToWikiMarkup(target);
    }), vscode.commands.registerCommand("md2doc.convertWordCurrentFile", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }
        await convertWordToMarkdown(editor.document.uri);
    }), vscode.commands.registerCommand("md2doc.convertWordFile", async (resource) => {
        const target = resource ?? vscode.window.activeTextEditor?.document.uri;
        if (!target) {
            vscode.window.showErrorMessage("No Word file selected.");
            return;
        }
        await convertWordToMarkdown(target);
    }));
}
function deactivate() {
    return undefined;
}
async function convertMarkdownToWord(resource) {
    if (resource.scheme !== "file") {
        vscode.window.showErrorMessage("Only local files are supported.");
        return;
    }
    const config = vscode.workspace.getConfiguration("md2doc");
    const openAfterExport = config.get("openAfterExport", false);
    const exportFormat = config.get("exportFormat", "doc");
    let outputPath;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Converting Markdown to ${exportFormat.toUpperCase()}`,
        cancellable: false
    }, async () => {
        try {
            outputPath = await (0, converter_1.convertMarkdownFile)(resource.fsPath, {
                exportFormat,
                libreOfficePath: config.get("libreOfficePath", ""),
                outputDirectory: config.get("outputDirectory", ""),
                pandocPath: config.get("pandocPath", "pandoc")
            });
        }
        catch (error) {
            showError("MD to DOC conversion failed", error);
        }
    });
    if (outputPath) {
        await showCreatedMessage(outputPath, openAfterExport);
    }
}
async function convertWordToMarkdown(resource) {
    if (resource.scheme !== "file") {
        vscode.window.showErrorMessage("Only local files are supported.");
        return;
    }
    const config = vscode.workspace.getConfiguration("md2doc");
    const openAfterExport = config.get("openAfterExport", false);
    let outputPath;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Converting Word to Markdown",
        cancellable: false
    }, async () => {
        try {
            outputPath = await (0, converter_1.convertWordFile)(resource.fsPath, {
                libreOfficePath: config.get("libreOfficePath", ""),
                outputDirectory: config.get("outputDirectory", ""),
                pandocPath: config.get("pandocPath", "pandoc")
            });
        }
        catch (error) {
            showError("DOC to MD conversion failed", error);
        }
    });
    if (outputPath) {
        await showCreatedMessage(outputPath, openAfterExport);
    }
}
async function convertMarkdownToWikiMarkup(resource) {
    if (resource.scheme !== "file") {
        vscode.window.showErrorMessage("Only local files are supported.");
        return;
    }
    const config = vscode.workspace.getConfiguration("md2doc");
    const openAfterExport = config.get("openAfterExport", false);
    let outputPath;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Converting Markdown to Confluence Wiki Markup",
        cancellable: false
    }, async () => {
        try {
            outputPath = await (0, converter_1.convertMarkdownToWikiMarkupFile)(resource.fsPath, {
                outputDirectory: config.get("outputDirectory", "")
            });
        }
        catch (error) {
            showError("MD to Wiki Markup conversion failed", error);
        }
    });
    if (outputPath) {
        await showCreatedMessage(outputPath, openAfterExport);
    }
}
async function showCreatedMessage(outputPath, openAfterExport) {
    const openAction = "Open";
    const selection = await vscode.window.showInformationMessage(`Created ${path.basename(outputPath)}`, ...(openAfterExport ? [openAction] : []));
    if (openAfterExport || selection === openAction) {
        await vscode.env.openExternal(vscode.Uri.file(outputPath));
    }
}
function showError(prefix, error) {
    const message = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(`${prefix}: ${message}`);
}
//# sourceMappingURL=extension.js.map