import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "public");

const svg = fs.readFileSync(path.join(publicDir, "favicon.svg"), "utf8");

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: transparent; }
  </style>
</head>
<body>
  <div id="svg-wrap" style="width: 512px; height: 512px;">${svg}</div>
  <canvas id="c" width="512" height="512"></canvas>
  <script>
    const svgElem = document.querySelector('svg');
    svgElem.setAttribute('width', '512');
    svgElem.setAttribute('height', '512');
    const xml = new XMLSerializer().serializeToString(svgElem);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 512, 512);
      c.toBlob(async (blob) => {
        await fetch('/save-png', { method: 'POST', body: blob });
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;base64,' + svg64;
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } else if (req.method === "POST" && req.url === "/save-png") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(path.join(publicDir, "favicon-512x512.png"), buffer);
      console.log("Saved favicon-512x512.png successfully");
      res.writeHead(200);
      res.end("OK");
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 500);
    });
  }
});

server.listen(9879, () => {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--window-size=512,512",
    "http://localhost:9879"
  ]);
});
