import fs from "fs";
import path from "path";

const IGNORED_DIRS = new Set([
  "node_modules", "dist", "build", ".git", "__pycache__", ".venv", "vendor",
]);

export interface FileNode {
  name: string;
  path: string;       // 相对路径
  type: "file" | "dir";
  children?: FileNode[];
}

export function scanDirectory(rootDir: string): FileNode[] {
  const result: FileNode[] = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) continue;

    const relativePath = entry.name;

    if (entry.isDirectory()) {
      const children = scanDirectoryRecursive(
        path.join(rootDir, entry.name),
        relativePath
      );
      if (children.length > 0) {
        result.push({
          name: entry.name,
          path: relativePath,
          type: "dir",
          children,
        });
      }
    } else if (entry.name.endsWith(".md")) {
      result.push({
        name: entry.name,
        path: relativePath,
        type: "file",
      });
    }
  }

  return sortNodes(result);
}

function scanDirectoryRecursive(
  absDir: string,
  relativeBase: string
): FileNode[] {
  const result: FileNode[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return result;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) continue;

    const relativePath = relativeBase + "/" + entry.name;

    if (entry.isDirectory()) {
      const children = scanDirectoryRecursive(
        path.join(absDir, entry.name),
        relativePath
      );
      if (children.length > 0) {
        result.push({
          name: entry.name,
          path: relativePath,
          type: "dir",
          children,
        });
      }
    } else if (entry.name.endsWith(".md")) {
      result.push({
        name: entry.name,
        path: relativePath,
        type: "file",
      });
    }
  }

  return sortNodes(result);
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function readMarkdownFile(rootDir: string, filePath: string): string {
  const absPath = path.resolve(rootDir, filePath);
  const resolved = path.resolve(absPath);

  // 防止路径穿越
  if (!resolved.startsWith(path.resolve(rootDir))) {
    throw new Error("Access denied: path traversal detected");
  }

  return fs.readFileSync(resolved, "utf-8");
}
