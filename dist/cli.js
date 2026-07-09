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
const path = __importStar(require("node:path"));
const converter_1 = require("./converter");
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
            const outputPath = await (0, converter_1.convertMarkdownFile)(resolvedInputPath, {
                exportFormat: args.format ?? "doc",
                libreOfficePath: args.libreoffice,
                outputDirectory: resolveCliOutputDirectory(args["output-dir"]),
                pandocPath: args.pandoc
            });
            console.log(outputPath);
            return;
        }
        case "doc2md": {
            const outputPath = await (0, converter_1.convertWordFile)(resolvedInputPath, {
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
function parseArgs(args) {
    const parsed = {};
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
function resolveCliOutputDirectory(outputDirectory) {
    return outputDirectory ? path.resolve(outputDirectory) : undefined;
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map