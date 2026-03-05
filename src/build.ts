#!/usr/bin/env node

/**
 * 静态构建模式：把指定目录的 MD 文件编译为纯 HTML 静态网站
 * 用法：node dist/build.js ./docs ./out
 */

import fs from "fs";
import path from "path";
import { scanDirectory, readMarkdownFile, FileNode } from "./scanner.js";
import { renderMarkdown } from "./renderer.js";

const sourceDir = path.resolve(process.argv[2] || ".");
const outputDir = path.resolve(process.argv[3] || "./out");

// 页面模板
function htmlTemplate(title: string, body: string, isIndex: boolean): string {
  const backLink = isIndex ? "" : '<a href="/" class="back-link">← 返回列表</a>';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - MD Viewer</title>
  <style>${getStyles()}</style>
</head>
<body>
  <div class="container">
    ${backLink}
    ${body}
  </div>
  <script>${getThemeScript()}</script>
</body>
</html>`;
}

function getStyles(): string {
  return `
:root {
  --bg: #ffffff; --bg2: #f6f8fa; --text: #1f2937; --text2: #6b7280;
  --border: #e5e7eb; --accent: #3b82f6; --code-bg: #f1f5f9;
}
[data-theme="dark"] {
  --bg: #0d1117; --bg2: #161b22; --text: #e6edf3; --text2: #8b949e;
  --border: #30363d; --accent: #58a6ff; --code-bg: #1c2128;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
}
.container { max-width: 800px; margin: 0 auto; padding: 20px 16px; }
.back-link {
  display: inline-block; margin-bottom: 16px; color: var(--accent);
  text-decoration: none; font-size: 14px;
}
.back-link:hover { text-decoration: underline; }

/* 首页 */
.site-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.site-header h1 { font-size: 22px; }
#theme-toggle {
  background: none; border: 1px solid var(--border); border-radius: 6px;
  padding: 4px 10px; cursor: pointer; font-size: 16px;
}
.search-box {
  width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg2); color: var(--text); font-size: 15px; outline: none; margin-bottom: 16px;
}
.search-box:focus { border-color: var(--accent); }
.file-list { list-style: none; }
.file-item {
  display: block; padding: 12px 16px; margin-bottom: 4px; border-radius: 8px;
  color: var(--text); text-decoration: none; transition: background 0.15s;
}
.file-item:hover { background: var(--bg2); }
.file-item .name { font-weight: 500; }
.file-item .path { font-size: 13px; color: var(--text2); }
.dir-name { font-weight: 600; color: var(--text2); margin: 16px 0 8px; font-size: 14px; }

/* 文章页 */
.article h1 { font-size: 2em; margin: 0.5em 0; padding-bottom: 0.3em; border-bottom: 1px solid var(--border); }
.article h2 { font-size: 1.5em; margin: 1em 0 0.5em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border); }
.article h3 { font-size: 1.25em; margin: 1em 0 0.5em; }
.article p { margin: 0.8em 0; }
.article a { color: var(--accent); text-decoration: none; }
.article a:hover { text-decoration: underline; }
.article code {
  background: var(--code-bg); padding: 2px 6px; border-radius: 4px; font-size: 0.9em;
  font-family: "Fira Code", Consolas, monospace;
}
.article pre {
  background: var(--code-bg); border: 1px solid var(--border); border-radius: 8px;
  padding: 16px; overflow-x: auto; margin: 1em 0;
}
.article pre code { background: none; padding: 0; font-size: 14px; line-height: 1.5; }
.article blockquote {
  border-left: 4px solid var(--accent); padding: 4px 16px; margin: 1em 0;
  color: var(--text2); background: var(--bg2); border-radius: 0 4px 4px 0;
}
.article table { border-collapse: collapse; width: 100%; margin: 1em 0; display: block; overflow-x: auto; }
.article th, .article td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
.article th { background: var(--bg2); font-weight: 600; }
.article img { max-width: 100%; border-radius: 8px; }
.article ul, .article ol { padding-left: 2em; margin: 0.5em 0; }
.article li { margin: 0.25em 0; }
.article hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }

.hljs-keyword { color: #d73a49; } .hljs-string { color: #032f62; }
.hljs-comment { color: #6a737d; } .hljs-number { color: #005cc5; }
[data-theme="dark"] .hljs-keyword { color: #ff7b72; }
[data-theme="dark"] .hljs-string { color: #a5d6ff; }
[data-theme="dark"] .hljs-comment { color: #8b949e; }
[data-theme="dark"] .hljs-number { color: #79c0ff; }
`;
}

function getThemeScript(): string {
  return `
(function() {
  var s = localStorage.getItem('md-theme');
  if (s === 'dark' || (!s && matchMedia('(prefers-color-scheme:dark)').matches))
    document.documentElement.setAttribute('data-theme','dark');
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.onclick = function() {
    var d = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement[d?'removeAttribute':'setAttribute']('data-theme', d?'':'dark');
    btn.textContent = d ? '🌙' : '☀️';
    localStorage.setItem('md-theme', d ? 'light' : 'dark');
  };
  var search = document.getElementById('search');
  if (search) search.oninput = function() {
    var q = search.value.toLowerCase();
    document.querySelectorAll('.file-item').forEach(function(el) {
      el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
})();
`;
}

// 把文件树扁平化
function flattenFiles(nodes: FileNode[], prefix?: string): { name: string; filePath: string; dir: string }[] {
  const result: { name: string; filePath: string; dir: string }[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      result.push({ name: node.name, filePath: node.path, dir: prefix || "" });
    } else if (node.children) {
      result.push(...flattenFiles(node.children, node.path));
    }
  }
  return result;
}

// 文件路径转 URL 路径
function filePathToUrlPath(filePath: string): string {
  return filePath.replace(/\.md$/i, ".html").replace(/\\/g, "/");
}

// 构建
function build() {
  console.log(`源目录: ${sourceDir}`);
  console.log(`输出目录: ${outputDir}`);

  const tree = scanDirectory(sourceDir);
  const files = flattenFiles(tree);

  if (files.length === 0) {
    console.log("未找到任何 .md 文件");
    process.exit(1);
  }

  // 清理输出目录
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });

  // 生成首页
  let indexBody = `
    <div class="site-header">
      <h1>MD Viewer</h1>
      <button id="theme-toggle">🌙</button>
    </div>
    <input type="text" id="search" class="search-box" placeholder="搜索文件...">
    <ul class="file-list">`;

  let lastDir = "";
  for (const file of files) {
    if (file.dir && file.dir !== lastDir) {
      indexBody += `<li class="dir-name">📁 ${file.dir}</li>`;
      lastDir = file.dir;
    }
    const href = "/" + filePathToUrlPath(file.filePath);
    indexBody += `
      <a href="${href}" class="file-item">
        <div class="name">📄 ${file.name.replace(/\.md$/i, "")}</div>
        ${file.dir ? `<div class="path">${file.filePath}</div>` : ""}
      </a>`;
  }

  indexBody += "</ul>";
  fs.writeFileSync(path.join(outputDir, "index.html"), htmlTemplate("首页", indexBody, true));
  console.log(`✓ index.html`);

  // 生成每个 MD 文件的页面
  for (const file of files) {
    const raw = readMarkdownFile(sourceDir, file.filePath);
    const html = renderMarkdown(raw);
    const title = file.name.replace(/\.md$/i, "");
    const articleBody = `<article class="article">${html}</article>`;
    const page = htmlTemplate(title, articleBody, false);

    const outPath = path.join(outputDir, filePathToUrlPath(file.filePath));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, page);
    console.log(`✓ ${filePathToUrlPath(file.filePath)}`);
  }

  console.log(`\n构建完成！共 ${files.length + 1} 个页面 → ${outputDir}`);
}

build();
