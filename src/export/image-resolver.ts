/**
 * Resolves Markdown images and reads bytes through VS Code's filesystem providers.
 * Pure image decoding and print-area scaling stay in ./image-dimensions.
 */
import * as vscode from "vscode";
import { dimensionsForPath, type ImageIo, type ResolvedImage } from "./image-dimensions";
import { resolveImageTarget } from "../link-targets";
import { isDocumentResourceUri } from "../link-targets/resource-schemes";

export type { ResolvedImage } from "./image-dimensions";

export interface ImageWarning {
  url: string;
  reason: string;
}

/** The string is a serialized URI, preserving file and vscode-remote authorities. */
const workspaceIo: ImageIo = {
  exists: async (resource: string) => {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.parse(resource));
      return true;
    } catch {
      return false;
    }
  },
  readFile: async (resource: string) =>
    Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.parse(resource))),
};

/** Resolves every image independently; one failure never aborts the DOCX export. */
export async function resolveImages(
  imageUrls: string[],
  documentUri: vscode.Uri,
  token?: vscode.CancellationToken,
): Promise<{ images: Map<string, ResolvedImage>; warnings: ImageWarning[] }> {
  const images = new Map<string, ResolvedImage>();
  const warnings: ImageWarning[] = [];

  for (const url of imageUrls) {
    if (token?.isCancellationRequested) break;
    const trimmed = url.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      warnings.push({ url: trimmed, reason: "remote" });
      continue;
    }
    if (trimmed.startsWith("data:")) {
      warnings.push({ url: trimmed, reason: "data-uri" });
      continue;
    }

    try {
      const target = resolveImageTarget(trimmed, documentUri);
      if (!target || !isDocumentResourceUri(target)) {
        warnings.push({ url: trimmed, reason: "not-found" });
        continue;
      }
      const entry = await dimensionsForPath(target.toString(), workspaceIo);
      if (!entry) {
        warnings.push({ url: trimmed, reason: "not-found" });
        continue;
      }
      images.set(url, entry);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      warnings.push({ url: trimmed, reason: `read-error: ${detail}` });
    }
  }

  return { images, warnings };
}
