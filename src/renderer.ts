import { marked } from "marked";
import hljs from "highlight.js";

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: false,
});

export function renderMarkdown(content: string): string {
  // 先用 marked 渲染，再对 code block 做高亮
  let html = marked.parse(content) as string;

  // 对 <code class="language-xxx"> 做高亮
  html = html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang: string, code: string) => {
      const decoded = code
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
      if (hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(decoded, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      }
      return `<pre><code class="hljs">${code}</code></pre>`;
    }
  );

  // 无语言标记的 code block 自动检测
  html = html.replace(
    /<pre><code>([\s\S]*?)<\/code><\/pre>/g,
    (_match, code: string) => {
      const decoded = code
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
      const highlighted = hljs.highlightAuto(decoded).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    }
  );

  return html;
}
