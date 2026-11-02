import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "public");

const heroB64 = fs.readFileSync(path.join(publicDir, "preview-hero.png")).toString("base64");
const shopB64 = fs.readFileSync(path.join(publicDir, "preview-shop.png")).toString("base64");
const checkoutB64 = fs.readFileSync(path.join(publicDir, "preview-checkout.png")).toString("base64");
const authB64 = fs.readFileSync(path.join(publicDir, "preview-auth.png")).toString("base64");

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Buzzko Website Feature Walkthrough</title>
  <style>
    body { margin: 0; background: #09090b; display: grid; place-items: center; min-height: 100vh; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    canvas { width: 1280px; height: 720px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); }
  </style>
</head>
<body>
<canvas id="c" width="1280" height="720"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

function loadImg(b64) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.src = 'data:image/png;base64,' + b64;
  });
}

Promise.all([
  loadImg("${heroB64}"),
  loadImg("${shopB64}"),
  loadImg("${checkoutB64}"),
  loadImg("${authB64}")
]).then(([heroImg, shopImg, checkoutImg, authImg]) => {
  startRecording([heroImg, shopImg, checkoutImg, authImg]);
});

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function startRecording(screens) {
  const [heroImg, shopImg, checkoutImg, authImg] = screens;
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
  });
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    await fetch('/save-video', { method: 'POST', body: blob });
    console.log('Feature walkthrough video saved successfully');
  };
  recorder.start();

  const totalDuration = 14; // 14 seconds
  const startTime = performance.now();

  function render(time) {
    const elapsed = (time - startTime) / 1000;
    const progress = Math.min(elapsed / totalDuration, 1);
    const t = elapsed;

    // Dark sleek background with subtle colorful aura
    ctx.fillStyle = '#0F0F13';
    ctx.fillRect(0, 0, W, H);

    // Glowing background orbs
    ctx.save();
    const g1 = ctx.createRadialGradient(250 + Math.sin(t) * 60, 200, 20, 250, 200, 450);
    g1.addColorStop(0, 'rgba(255, 77, 141, 0.22)');
    g1.addColorStop(1, 'rgba(255, 77, 141, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(1050 + Math.cos(t * 1.2) * 60, 500, 20, 1050, 500, 500);
    g2.addColorStop(0, 'rgba(157, 78, 221, 0.22)');
    g2.addColorStop(1, 'rgba(157, 78, 221, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Browser Mockup Dimensions
    const bX = 380;
    const bY = 70;
    const bW = 860;
    const bH = 590;
    const titleH = 40;

    // Helper: Draw Browser Window
    function drawBrowser(imgSrc, scrollY = 0, zoom = 1, panX = 0, panY = 0) {
      ctx.save();
      // Outer shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;

      // Window Frame
      drawRoundedRect(ctx, bX, bY, bW, bH, 16);
      ctx.fillStyle = '#18181B';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#27272A';
      ctx.stroke();

      // Top Title Bar
      drawRoundedRect(ctx, bX, bY, bW, titleH, 16);
      ctx.fillStyle = '#1F1F23';
      ctx.fill();

      // Window controls (Red, Yellow, Green dots)
      const dotY = bY + titleH / 2;
      ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(bX + 22, dotY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(bX + 42, dotY, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10B981'; ctx.beginPath(); ctx.arc(bX + 62, dotY, 6, 0, Math.PI * 2); ctx.fill();

      // Address bar pill
      drawRoundedRect(ctx, bX + 160, bY + 8, bW - 320, 24, 12);
      ctx.fillStyle = '#121215';
      ctx.fill();
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒 surajit00007.github.io/Buzzko_website', bX + bW / 2, bY + 20);

      // Web content viewport (clipped)
      ctx.save();
      ctx.beginPath();
      ctx.rect(bX, bY + titleH, bW, bH - titleH);
      ctx.clip();

      const imgW = imgSrc.naturalWidth || imgSrc.width || 1280;
      const imgH = imgSrc.naturalHeight || imgSrc.height || 720;
      const vW = bW * zoom;
      const vH = (bW / imgW) * imgH * zoom;
      const renderX = bX - panX;
      const renderY = (bY + titleH) - scrollY - panY;

      ctx.drawImage(imgSrc, 0, 0, imgW, imgH, renderX, renderY, vW, vH);
      ctx.restore();

      ctx.restore();
    }

    // Left Feature Info Card
    function drawFeaturePanel(badge, title, subtitle, bullets, highlightColor) {
      ctx.save();
      ctx.translate(50, 80);

      // Top Brand Pill
      drawRoundedRect(ctx, 0, 0, 160, 32, 16);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.fillStyle = highlightColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badge, 80, 16);

      // Section Title
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(title, 0, 48);

      // Subtitle
      ctx.font = '500 16px sans-serif';
      ctx.fillStyle = '#A1A1AA';
      ctx.fillText(subtitle, 0, 96);

      // Bullet Features Card
      drawRoundedRect(ctx, 0, 150, 300, 240, 16);
      ctx.fillStyle = 'rgba(24, 24, 27, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#27272A';
      ctx.stroke();

      bullets.forEach((b, i) => {
        const itemY = 175 + i * 50;
        // Check dot
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.arc(24, itemY + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#F4F4F5';
        ctx.fillText(b.label, 40, itemY);

        ctx.font = '400 13px sans-serif';
        ctx.fillStyle = '#71717A';
        ctx.fillText(b.desc, 40, itemY + 20);
      });

      // Bottom Tech Pill
      drawRoundedRect(ctx, 0, 415, 300, 46, 23);
      ctx.fillStyle = 'rgba(255, 77, 141, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 77, 141, 0.3)';
      ctx.stroke();
      ctx.font = '600 13px sans-serif';
      ctx.fillStyle = '#FF4D8D';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 100% Static Prerendered on GitHub Pages', 150, 438);

      ctx.restore();
    }

    // Pointer cursor simulation
    function drawCursor(x, y, clicking = false) {
      ctx.save();
      ctx.translate(x, y);
      if (clicking) {
        ctx.scale(0.88, 0.88);
        ctx.fillStyle = 'rgba(255, 77, 141, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(4, 13);
      ctx.lineTo(8, 20);
      ctx.lineTo(11, 18);
      ctx.lineTo(7, 11);
      ctx.lineTo(13, 11);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      ctx.restore();
    }

    // TIMELINE PHASES
    if (elapsed < 3.5) {
      // PHASE 1: Hero & Interactive Physics Charm Stage
      drawFeaturePanel(
        'FEATURE 01',
        'Interactive Hero',
        'Physics-based charm stage',
        [
          { label: 'Pointer Parallax', desc: 'Real-time tilt and depth tracking' },
          { label: '1-Click Bag Addition', desc: 'Direct cart binding on each charm' },
          { label: 'Dynamic Price Tags', desc: 'Live formatted INR pricing tags' },
          { label: 'Responsive Layout', desc: 'Asymmetric slots with fluid vw sizing' }
        ],
        '#FF4D8D'
      );

      // Animate simulated cursor moving across the hero charms
      const s1Progress = elapsed / 3.5;
      const cursorX = bX + 200 + Math.sin(s1Progress * Math.PI * 2) * 150;
      const cursorY = bY + 220 + Math.cos(s1Progress * Math.PI * 2) * 80;
      const isClick = Math.sin(s1Progress * Math.PI * 4) > 0.85;

      drawBrowser(heroImg, 0, 1.05, Math.sin(t * 1.5) * 15, Math.cos(t * 1.5) * 10);
      drawCursor(cursorX, cursorY, isClick);

    } else if (elapsed < 7.0) {
      // PHASE 2: Shop Collection & Filtering System
      drawFeaturePanel(
        'FEATURE 02',
        'Catalogue & Filters',
        'Cloud-synced product collections',
        [
          { label: 'Category Filter Chips', desc: 'Instant All / Keychains / Charms' },
          { label: 'Strikethrough Pricing', desc: 'Derived discounts & sale calculation' },
          { label: 'Conditional OfferStrip', desc: 'Banner validates collection prices' },
          { label: 'Modal Zoom Preview', desc: 'High-res image inspection dialog' }
        ],
        '#FBBF24'
      );

      // Scroll smoothly down the shop page
      const s2Progress = (elapsed - 3.5) / 3.5;
      const scrollY = Math.min(s2Progress * 220, 220);
      drawBrowser(shopImg, scrollY, 1.02);

      // Cursor clicks filter chip
      const cursorX = bX + 460 + Math.sin(t * 2) * 50;
      const cursorY = bY + 140;
      drawCursor(cursorX, cursorY, Math.sin(t * 4) > 0.7);

    } else if (elapsed < 10.5) {
      // PHASE 3: Seamless WhatsApp Checkout Workflow
      drawFeaturePanel(
        'FEATURE 03',
        'WhatsApp Checkout',
        'Zero-friction click-to-chat order',
        [
          { label: 'Strict Zod Validation', desc: 'Validates Indian mobile & PIN codes' },
          { label: 'Cash on Delivery Spec', desc: 'Explicit COD delivery preferences' },
          { label: 'Pre-formatted Handoff', desc: 'Auto-generates itemised WA message' },
          { label: 'Dynamic Bag Subtotal', desc: 'Calculates live selling prices' }
        ],
        '#22C55E'
      );

      // Show Checkout Screen
      const s3Progress = (elapsed - 7.0) / 3.5;
      drawBrowser(checkoutImg, 40, 1.02);

      // Cursor over the "Order on WhatsApp" button
      const cursorX = bX + 280;
      const cursorY = bY + 460 + Math.sin(t * 3) * 5;
      drawCursor(cursorX, cursorY, Math.sin(t * 5) > 0.8);

    } else {
      // PHASE 4: Modern Architecture & Tech Stack Showcase
      ctx.save();
      ctx.textAlign = 'center';

      // Header
      drawRoundedRect(ctx, W / 2 - 120, 50, 240, 34, 17);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.fillStyle = '#84CC16';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('FEATURE 04 • TECH STACK', W / 2, 67);

      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Engineered for Speed, Reliability & UX', W / 2, 130);

      ctx.font = '500 18px sans-serif';
      ctx.fillStyle = '#A1A1AA';
      ctx.fillText('Full-stack modern e-commerce architecture without heavy server overhead', W / 2, 168);

      // 4 Architecture Cards Grid
      const cards = [
        {
          tag: 'ROUTING & SSR',
          title: 'TanStack Start + Router',
          desc: 'Type-safe file-based routing, static prerendering, and hydration-safe architecture.',
          color: '#FF4D8D',
          col: 0, row: 0
        },
        {
          tag: 'UI & STYLING',
          title: 'React 19 + Tailwind v4',
          desc: 'High-performance UI with Radix accessibility primitives and Fredoka typography.',
          color: '#9D4EDD',
          col: 1, row: 0
        },
        {
          tag: 'CLOUD BACKEND',
          title: 'Supabase Database & Auth',
          desc: 'PostgreSQL with Row Level Security, private signed buckets, and admin Studio role check.',
          color: '#22C55E',
          col: 0, row: 1
        },
        {
          tag: 'DEPLOYMENT CI/CD',
          title: 'GitHub Pages Automated CI',
          desc: 'Automated GitHub Actions build with subpath resolution, .nojekyll, and 404 SPA fallback.',
          color: '#06B6D4',
          col: 1, row: 1
        }
      ];

      cards.forEach((card) => {
        const cardW = 460;
        const cardH = 160;
        const cx = 350 + card.col * 500;
        const cy = 270 + card.row * 180;

        ctx.save();
        ctx.translate(cx, cy);

        // Card container
        drawRoundedRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 20);
        ctx.fillStyle = '#18181B';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#27272A';
        ctx.stroke();

        // Accent top line
        ctx.save();
        drawRoundedRect(ctx, -cardW / 2, -cardH / 2, cardW, 4, 2);
        ctx.fillStyle = card.color;
        ctx.fill();
        ctx.restore();

        // Tag
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = card.color;
        ctx.textAlign = 'left';
        ctx.fillText(card.tag, -cardW / 2 + 28, -cardH / 2 + 36);

        // Title
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#F4F4F5';
        ctx.fillText(card.title, -cardW / 2 + 28, -cardH / 2 + 68);

        // Description
        ctx.font = '400 14px sans-serif';
        ctx.fillStyle = '#A1A1AA';
        ctx.fillText(card.desc, -cardW / 2 + 28, -cardH / 2 + 102, cardW - 56);

        ctx.restore();
      });

      // Bottom URL banner
      drawRoundedRect(ctx, W / 2 - 250, 640, 500, 48, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.fillText('👉 Explore Live: surajit00007.github.io/Buzzko_website', W / 2, 665);

      ctx.restore();
    }

    if (progress < 1) {
      requestAnimationFrame(render);
    } else {
      setTimeout(() => recorder.stop(), 500);
    }
  }

  requestAnimationFrame(render);
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } else if (req.method === "POST" && req.url === "/save-video") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const outPublic = path.join(publicDir, "buzzko-website-demo.webm");
      const outAssets = path.join(rootDir, "Assets", "buzzko-website-demo.webm");

      fs.writeFileSync(outPublic, buffer);
      fs.writeFileSync(outAssets, buffer);

      console.log(`Website feature demo video saved: ${outPublic} (${buffer.length} bytes)`);
      res.writeHead(200);
      res.end("OK");

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 500);
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(9877, () => {
  console.log("Website feature demo server listening at http://localhost:9877");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--window-size=1280,720",
    "http://localhost:9877"
  ]);

  edge.on("error", (err) => {
    console.error("Failed to spawn Edge:", err);
    server.close();
    process.exit(1);
  });
});

