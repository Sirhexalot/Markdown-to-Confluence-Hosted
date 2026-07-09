import * as path from "node:path";
import * as vscode from "vscode";
import {
  convertMarkdownFile,
  convertMarkdownToWikiMarkupFile,
  convertMarkdownToWikiMarkupString,
  convertWordFile
} from "./converter";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("md2doc.convertCurrentFile", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      await convertMarkdownToWord(editor.document.uri);
    }),
    vscode.commands.registerCommand("md2doc.convertFile", async (resource?: vscode.Uri) => {
      const target = resource ?? vscode.window.activeTextEditor?.document.uri;
      if (!target) {
        vscode.window.showErrorMessage("No Markdown file selected.");
        return;
      }

      await convertMarkdownToWord(target);
    }),
    vscode.commands.registerCommand("md2doc.convertMarkdownToWikiFile", async (resource?: vscode.Uri) => {
      const target = resource ?? vscode.window.activeTextEditor?.document.uri;
      if (!target) {
        vscode.window.showErrorMessage("No Markdown file selected.");
        return;
      }

      await convertMarkdownToWikiMarkup(target);
    }),
    vscode.commands.registerCommand(
      "md2doc.convertMarkdownToWikiClipboard",
      async (resource?: vscode.Uri) => {
        const target = resource ?? vscode.window.activeTextEditor?.document.uri;
        if (!target) {
          vscode.window.showErrorMessage("No Markdown file selected.");
          return;
        }

        await copyMarkdownToWikiMarkupClipboard(target);
      }
    ),
    vscode.commands.registerCommand("md2doc.convertWordCurrentFile", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
      }

      await convertWordToMarkdown(editor.document.uri);
    }),
    vscode.commands.registerCommand("md2doc.convertWordFile", async (resource?: vscode.Uri) => {
      const target = resource ?? vscode.window.activeTextEditor?.document.uri;
      if (!target) {
        vscode.window.showErrorMessage("No Word file selected.");
        return;
      }

      await convertWordToMarkdown(target);
    })
  );
}

export function deactivate() {
  return undefined;
}

async function convertMarkdownToWord(resource: vscode.Uri) {
  if (resource.scheme !== "file") {
    vscode.window.showErrorMessage("Only local files are supported.");
    return;
  }

  let outputPath: string | undefined;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Converting Markdown to DOC",
      cancellable: false
    },
    async () => {
      try {
        outputPath = await convertMarkdownFile(resource.fsPath);
      } catch (error) {
        showError("MD to DOC conversion failed", error);
      }
    }
  );

  if (outputPath) {
    await showCreatedMessage(outputPath);
  }
}

async function convertWordToMarkdown(resource: vscode.Uri) {
  if (resource.scheme !== "file") {
    vscode.window.showErrorMessage("Only local files are supported.");
    return;
  }

  let outputPath: string | undefined;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Converting Word to Markdown",
      cancellable: false
    },
    async () => {
      try {
        outputPath = await convertWordFile(resource.fsPath);
      } catch (error) {
        showError("DOC to MD conversion failed", error);
      }
    }
  );

  if (outputPath) {
    await showCreatedMessage(outputPath);
  }
}

async function convertMarkdownToWikiMarkup(resource: vscode.Uri) {
  if (resource.scheme !== "file") {
    vscode.window.showErrorMessage("Only local files are supported.");
    return;
  }

  let outputPath: string | undefined;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Converting Markdown to Confluence Wiki Markup",
      cancellable: false
    },
    async () => {
      try {
        outputPath = await convertMarkdownToWikiMarkupFile(resource.fsPath);
      } catch (error) {
        showError("MD to Wiki Markup conversion failed", error);
      }
    }
  );

  if (outputPath) {
    await showCreatedMessage(outputPath);
  }
}

async function copyMarkdownToWikiMarkupClipboard(resource: vscode.Uri) {
  if (resource.scheme !== "file") {
    vscode.window.showErrorMessage("Only local files are supported.");
    return;
  }

  let wikiMarkup: string | undefined;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Converting Markdown to Confluence Wiki Markup and copying to clipboard",
      cancellable: false
    },
    async () => {
      try {
        wikiMarkup = await convertMarkdownToWikiMarkupString(resource.fsPath);
      } catch (error) {
        showError("MD to Wiki Markup clipboard conversion failed", error);
      }
    }
  );

  if (!wikiMarkup) {
    return;
  }

  await vscode.env.clipboard.writeText(wikiMarkup);
  vscode.window.showInformationMessage("Confluence Wiki markup copied to clipboard.");
}

async function showCreatedMessage(outputPath: string) {
  const openAction = "Open";
  const selection = await vscode.window.showInformationMessage(
    `Created ${path.basename(outputPath)}`,
    openAction
  );

  if (selection === openAction) {
    await vscode.env.openExternal(vscode.Uri.file(outputPath));
  }
}

function showError(prefix: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  vscode.window.showErrorMessage(`${prefix}: ${message}`);
}
