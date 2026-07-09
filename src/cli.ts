import * as path from "node:path";
import { convertMarkdownFile, convertWordFile, type ExportFormat } from "./converter";

async function main() {
  const rawArgs = process.argv.slice(2).filter((arg, index) => !(index === 1 && arg === "--"));
  const [command, inputPath, ...restArgs] = rawArgs;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (!inputPath) {
    throw new Error("Missing input file path.");
  }

  const args = parseArgs(restArgs);
  const resolvedInputPath = path.resolve(inputPath);

  switch (command) {
    case "md2doc": {
      const outputPath = await convertMarkdownFile(resolvedInputPath, {
        exportFormat: (args.format as ExportFormat | undefined) ?? "doc",
        libreOfficePath: args.libreoffice,
        outputDirectory: resolveCliOutputDirectory(args["output-dir"]),
        pandocPath: args.pandoc
      });
      console.log(outputPath);
      return;
    }
    case "doc2md": {
      const outputPath = await convertWordFile(resolvedInputPath, {
        libreOfficePath: args.libreoffice,
        outputDirectory: resolveCliOutputDirectory(args["output-dir"]),
        pandocPath: args.pandoc
      });
      console.log(outputPath);
      return;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

function parseArgs(args: string[]) {
  const parsed: Record<string, string> = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (!current.startsWith("--")) {
      throw new Error(`Unexpected argument: ${current}`);
    }

    const key = current.slice(2);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage:
  pnpm test:md2doc -- <input.md> [--format doc|docx] [--output-dir <dir>] [--pandoc <path>] [--libreoffice <path>]
  pnpm test:doc2md -- <input.doc|input.docx> [--output-dir <dir>] [--pandoc <path>] [--libreoffice <path>]
`);
}

function resolveCliOutputDirectory(outputDirectory: string | undefined) {
  return outputDirectory ? path.resolve(outputDirectory) : undefined;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
