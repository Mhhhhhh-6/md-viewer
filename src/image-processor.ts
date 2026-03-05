import fs from "fs";
import path from "path";
import crypto from "crypto";

const IMAGE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".ico",
]);

/** 匹配 markdown 图片语法: ![alt](path) */
const MD_IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

/** 判断是否为本地绝对路径（Windows 或 Unix） */
function isLocalAbsolutePath(p: string): boolean {
  // Windows: C:\... 或 C:/...
  if (/^[A-Za-z]:[/\\]/.test(p)) return true;
  // Unix: /home/...
  if (p.startsWith("/") && !p.startsWith("//")) return true;
  return false;
}

/** 判断是否需要处理的图片路径（本地绝对路径或不在 images/ 下的相对路径） */
function needsProcessing(imgPath: string, mdFileDir: string, docsRoot: string): boolean {
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://") || imgPath.startsWith("data:")) {
    return false;
  }
  if (isLocalAbsolutePath(imgPath)) return true;
  // 已经是指向 images/ 的相对路径则跳过
  const normalized = imgPath.replace(/\\/g, "/");
  if (normalized.includes("images/")) return false;
  // 相对路径但图片文件存在于 md 同级目录
  const absImg = path.resolve(mdFileDir, imgPath);
  if (fs.existsSync(absImg) && isImageFile(absImg)) {
    // 如果已经在 docs 的 images 目录下，跳过
    const rel = path.relative(docsRoot, absImg).replace(/\\/g, "/");
    if (rel.startsWith("images/")) return false;
    return true;
  }
  return false;
}

function isImageFile(filePath: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

/** 生成短哈希避免文件名冲突 */
function shortHash(filePath: string): string {
  return crypto.createHash("md5").update(filePath).digest("hex").slice(0, 8);
}

/**
 * 处理单个 markdown 文件中的图片引用：
 * 1. 将本地绝对路径引用的图片复制到 docsRoot/images/
 * 2. 将 markdown 中的路径重写为相对路径
 * 返回是否有修改
 */
export function processMarkdownImages(
  mdAbsPath: string,
  docsRoot: string
): boolean {
  let content: string;
  try {
    content = fs.readFileSync(mdAbsPath, "utf-8");
  } catch {
    return false;
  }

  const imagesDir = path.join(docsRoot, "images");
  const mdFileDir = path.dirname(mdAbsPath);
  let modified = false;

  const newContent = content.replace(MD_IMAGE_RE, (match, alt: string, imgPath: string) => {
    const trimmed = imgPath.trim();

    if (!needsProcessing(trimmed, mdFileDir, docsRoot)) {
      return match;
    }

    // 解析图片的绝对路径
    let imgAbsPath: string;
    if (isLocalAbsolutePath(trimmed)) {
      imgAbsPath = trimmed;
    } else {
      imgAbsPath = path.resolve(mdFileDir, trimmed);
    }

    // 检查图片文件是否存在
    if (!fs.existsSync(imgAbsPath)) {
      console.log(`  [图片处理] 跳过不存在的图片: ${trimmed}`);
      return match;
    }

    // 确保 images 目录存在
    fs.mkdirSync(imagesDir, { recursive: true });

    // 生成目标文件名（原名 + 短哈希避免冲突）
    const ext = path.extname(imgAbsPath);
    const baseName = path.basename(imgAbsPath, ext);
    const hash = shortHash(imgAbsPath);
    const destName = `${baseName}-${hash}${ext}`;
    const destPath = path.join(imagesDir, destName);

    // 复制图片
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(imgAbsPath, destPath);
      console.log(`  [图片处理] 复制: ${path.basename(imgAbsPath)} -> images/${destName}`);
    }

    // 计算从 md 文件到 images/ 的相对路径
    const relPath = path.relative(mdFileDir, destPath).replace(/\\/g, "/");
    modified = true;
    return `![${alt}](${relPath})`;
  });

  if (modified) {
    fs.writeFileSync(mdAbsPath, newContent, "utf-8");
    console.log(`  [图片处理] 已更新: ${path.relative(docsRoot, mdAbsPath)}`);
  }

  return modified;
}

/**
 * 批量处理目录下所有 markdown 文件
 */
export function processAllMarkdownImages(docsRoot: string): number {
  let count = 0;
  processDir(docsRoot, docsRoot);
  return count;

  function processDir(dir: string, root: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "images") continue;
      const absPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        processDir(absPath, root);
      } else if (entry.name.endsWith(".md")) {
        if (processMarkdownImages(absPath, root)) {
          count++;
        }
      }
    }
  }
}
