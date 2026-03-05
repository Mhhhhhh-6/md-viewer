#!/usr/bin/env node

import path from "path";
import http from "http";
import os from "os";
import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import * as qrcodeTerminal from "qrcode-terminal";
import { scanDirectory, readMarkdownFile } from "./scanner.js";
import { renderMarkdown } from "./renderer.js";

const targetDir = path.resolve(process.argv[2] || ".");
const PORT = parseInt(process.env.PORT || "3456", 10);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 静态文件
app.use(express.static(path.join(__dirname, "..", "public")));

// API: 获取文件列表
app.get("/api/files", (_req, res) => {
  const tree = scanDirectory(targetDir);
  res.json(tree);
});

// API: 获取单个文件内容（渲染后的 HTML）
app.get("/api/file", (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    res.status(400).json({ error: "missing path parameter" });
    return;
  }
  try {
    const raw = readMarkdownFile(targetDir, filePath);
    const html = renderMarkdown(raw);
    res.json({ html, raw });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "read error";
    res.status(404).json({ error: message });
  }
});

// WebSocket: 文件变化通知
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

function broadcast(data: object) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// 监听文件变化
const watcher = chokidar.watch(targetDir, {
  ignored: /(^|[/\\])\./,
  ignoreInitial: true,
});

watcher.on("all", (event, filePath) => {
  if (!filePath.endsWith(".md")) return;
  const relative = path.relative(targetDir, filePath).replace(/\\/g, "/");
  broadcast({ event, path: relative });
});

// 获取局域网 IP（优先选真实局域网，跳过 VPN/虚拟网卡）
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  const candidates: { address: string; priority: number }[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family !== "IPv4" || iface.internal) continue;

      const addr = iface.address;
      const lowerName = name.toLowerCase();

      // 跳过已知的虚拟/代理网段
      if (addr.startsWith("198.18.")) continue;

      // 判断优先级：真实物理网卡 > 其他
      let priority = 0;
      if (lowerName.includes("wi-fi") || lowerName.includes("wifi") || lowerName.includes("wlan")) {
        priority = 100; // WiFi 最优先
      } else if (lowerName.includes("eth") || lowerName.includes("以太网")) {
        priority = 90; // 以太网次之
      } else if (addr.startsWith("192.168.") || addr.startsWith("10.") || addr.startsWith("172.")) {
        priority = 50; // 其他局域网地址
      } else {
        priority = 10;
      }

      // 降低虚拟网卡优先级
      if (lowerName.includes("vmware") || lowerName.includes("virtual") ||
          lowerName.includes("vbox") || lowerName.includes("hyper-v")) {
        priority = 5;
      }

      candidates.push({ address: addr, priority });
    }
  }

  if (candidates.length === 0) return "127.0.0.1";

  candidates.sort((a, b) => b.priority - a.priority);

  return candidates[0].address;
}

// 列出所有可用 IP 供用户选择
function getAllLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal && !iface.address.startsWith("198.18.")) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// 端口被占时自动杀掉旧进程
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.log(`  端口 ${PORT} 被占用，正在尝试释放...`);
    import("child_process").then(({ execSync }) => {
      try {
        const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: "utf-8" });
        const lines = output.trim().split("\n");
        const pids = new Set<string>();
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== "0" && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
        for (const pid of pids) {
          try { execSync(`taskkill /f /pid ${pid}`, { stdio: "ignore" }); } catch {}
        }
        console.log("  已释放，重新启动...\n");
        setTimeout(() => server.listen(PORT, "0.0.0.0"), 1000);
      } catch {
        console.error(`  无法释放端口 ${PORT}，请手动关闭占用进程后重试`);
        process.exit(1);
      }
    });
  } else {
    throw err;
  }
});

// 启动
server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  const allIPs = getAllLocalIPs();
  const url = `http://${ip}:${PORT}`;

  console.log("");
  console.log("  MD Viewer 已启动");
  console.log(`  监听目录: ${targetDir}`);
  console.log(`  本机访问: http://localhost:${PORT}`);
  console.log("");
  if (allIPs.length > 0) {
    console.log("  可用地址（手机请选择与电脑同网段的）:");
    for (const addr of allIPs) {
      const tag = addr === ip ? " ← 推荐" : "";
      console.log(`    http://${addr}:${PORT}${tag}`);
    }
  } else {
    console.log("  未检测到局域网地址，请确认 WiFi 连接");
  }
  console.log("");
  console.log("  手机扫描下方二维码:");
  console.log("");
  qrcodeTerminal.generate(url, { small: true }, (code: string) => {
    console.log(code);
  });
});

// 优雅退出
process.on("SIGINT", () => {
  watcher.close();
  server.close();
  process.exit(0);
});
