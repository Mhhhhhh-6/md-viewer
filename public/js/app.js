// === 状态 ===
let currentFile = null;
let fileTree = [];

// === DOM ===
const sidebar = document.getElementById("sidebar");
const fileTreeEl = document.getElementById("file-tree");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("theme-toggle");
const welcome = document.getElementById("welcome");
const reader = document.getElementById("reader");
const readerTitle = document.getElementById("reader-title");
const markdownBody = document.getElementById("markdown-body");
const backBtn = document.getElementById("back-btn");
const tocEl = document.getElementById("toc");

// === 文件列表 ===
async function loadFiles() {
  const res = await fetch("/api/files");
  fileTree = await res.json();
  renderTree(fileTree);
}

function renderTree(nodes, container, filter) {
  if (!container) {
    container = fileTreeEl;
    container.innerHTML = "";
  }

  for (const node of nodes) {
    if (filter && node.type === "file" && !node.name.toLowerCase().includes(filter)) {
      continue;
    }

    if (node.type === "dir") {
      const dirEl = document.createElement("div");
      dirEl.className = "tree-item dir";
      dirEl.innerHTML = '<span class="tree-icon">📁</span>' + node.name;
      dirEl.onclick = (e) => {
        e.stopPropagation();
        const children = dirEl.nextElementSibling;
        if (children) children.classList.toggle("hidden");
      };
      container.appendChild(dirEl);

      const childrenEl = document.createElement("div");
      childrenEl.className = "tree-children";
      container.appendChild(childrenEl);

      if (node.children) {
        renderTree(node.children, childrenEl, filter);
      }

      if (childrenEl.children.length === 0) {
        dirEl.remove();
        childrenEl.remove();
      }
    } else {
      const fileEl = document.createElement("div");
      fileEl.className = "tree-item";
      fileEl.innerHTML = '<span class="tree-icon">📄</span>' + node.name;
      fileEl.dataset.path = node.path;
      fileEl.onclick = () => openFile(node.path, node.name);
      container.appendChild(fileEl);
    }
  }
}

// === 打开文件 ===
async function openFile(filePath, fileName) {
  currentFile = filePath;

  // 高亮当前文件
  document.querySelectorAll(".tree-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.path === filePath);
  });

  const res = await fetch("/api/file?path=" + encodeURIComponent(filePath));
  const data = await res.json();

  if (data.error) {
    markdownBody.innerHTML = '<p style="color:red">加载失败: ' + data.error + "</p>";
    return;
  }

  readerTitle.textContent = fileName;
  markdownBody.innerHTML = data.html;

  // 生成 TOC
  buildTOC();

  // 切换视图
  welcome.classList.add("hidden");
  reader.classList.remove("hidden");

  // 移动端：隐藏侧边栏
  if (window.innerWidth <= 768) {
    sidebar.classList.add("hidden-mobile");
  }

  // 滚动到顶部
  document.getElementById("content").scrollTop = 0;
}

// === 返回按钮（移动端） ===
backBtn.onclick = () => {
  sidebar.classList.remove("hidden-mobile");
  reader.classList.add("hidden");
  welcome.classList.remove("hidden");
  currentFile = null;
};

// === 搜索 ===
searchInput.oninput = () => {
  const filter = searchInput.value.toLowerCase().trim();
  fileTreeEl.innerHTML = "";
  renderTree(fileTree, null, filter || undefined);
};

// === TOC 目录 ===
function buildTOC() {
  const headings = markdownBody.querySelectorAll("h1, h2, h3");
  if (headings.length < 3) {
    tocEl.classList.add("hidden");
    return;
  }

  let html = "<details open><summary>目录</summary><ul>";
  headings.forEach((h, i) => {
    const id = "heading-" + i;
    h.id = id;
    const indent = parseInt(h.tagName[1]) - 1;
    html += '<li style="margin-left:' + indent * 12 + 'px">';
    html += '<a href="#' + id + '">' + h.textContent + "</a></li>";
  });
  html += "</ul></details>";
  tocEl.innerHTML = html;
  tocEl.classList.remove("hidden");
}

// === 主题切换 ===
function initTheme() {
  const saved = localStorage.getItem("md-viewer-theme");
  if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
  }
}

themeToggle.onclick = () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "🌙";
    localStorage.setItem("md-viewer-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
    localStorage.setItem("md-viewer-theme", "dark");
  }
};

// === WebSocket 实时更新 ===
function connectWebSocket() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(protocol + "//" + location.host);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // 文件列表刷新
    loadFiles();

    // 当前文件变化则重新加载内容
    if (currentFile && data.path === currentFile) {
      openFile(currentFile, readerTitle.textContent);
    }
  };

  ws.onclose = () => {
    // 断线重连
    setTimeout(connectWebSocket, 3000);
  };
}

// === 启动 ===
initTheme();
loadFiles();
connectWebSocket();
