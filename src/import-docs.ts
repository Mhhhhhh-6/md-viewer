#!/usr/bin/env node

/**
 * 批量处理 docs 目录中所有 markdown 文件的图片引用
 * 用法: node dist/import-docs.js [docs目录]
 *
 * 功能:
 * - 扫描所有 .md 文件中的图片引用
 * - 将本地绝对路径的图片复制到 docs/images/ 目录
 * - 将 markdown 中的图片路径重写为相对路径
 */

import path from "path";
import { processAllMarkdownImages } from "./image-processor.js";

const docsDir = path.resolve(process.argv[2] || ".");

console.log(`\n  批量处理图片引用`);
console.log(`  目标目录: ${docsDir}\n`);

const count = processAllMarkdownImages(docsDir);

if (count > 0) {
  console.log(`\n  处理完成！共更新 ${count} 个文件`);
} else {
  console.log(`\n  所有文件的图片引用已是正确的相对路径，无需处理`);
}
