import fs from "node:fs/promises";
import path from "node:path";
import { lint } from "markdownlint/promise";

const rootDirectory = process.cwd();
const configPath = path.join(rootDirectory, ".markdownlint-cli2.jsonc");
const config = JSON.parse(await fs.readFile(configPath, "utf8"));

const inputPaths = process.argv.slice(2).filter((value, index) => !(index === 0 && value === "--"));
const filePaths = inputPaths.length > 0 ? inputPaths : await collectMarkdownFiles(rootDirectory);

if (filePaths.length === 0) {
  console.log("No Markdown files found.");
  process.exit(0);
}

const results = await lint({
  files: filePaths,
  config: config.config
});

let issueCount = 0;

for (const [filePath, issues] of Object.entries(results)) {
  for (const issue of issues) {
    issueCount += 1;
    const detail = issue.errorDetail ? ` ${issue.errorDetail}` : "";
    console.log(`${filePath}:${issue.lineNumber} ${issue.ruleNames[0]} ${issue.ruleDescription}${detail}`);
  }
}

if (issueCount > 0) {
  process.exitCode = 1;
}

async function collectMarkdownFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const markdownFiles = [];

  for (const entry of entries) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      markdownFiles.push(...await collectMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      markdownFiles.push(path.relative(rootDirectory, fullPath));
    }
  }

  return markdownFiles.sort();
}
