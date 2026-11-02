import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "public");

// Read website preview images to embed in the mobile frame
const heroB64 = fs.readFileSync(path.join(publicDir, "preview-hero.png")).toString("base64");
const shopB64 = fs.readFileSync(path.join(publicDir, "preview-shop.png")).toString("base64");
const checkoutB64 = fs.readFileSync(path.join(publicDir, "preview-checkout.png")).toString("base64");
const authB64 = fs.readFileSync(path.join(publicDir, "preview-auth.png")).toString("base64");

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Buzzko Website Feature Reel Generator</title>
  <style>
    body { margin: 0; background: #0b0c10; display: grid; place-items: center; min-height: 100vh; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    canvas { width: 720px; height: 1280px; box-shadow: 0 20px 50px rgba(0,0,0,0.7); }
  </style>
</head>
<body>
<canvas id="c" width="720" height="1280"></canvas>
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
  startAnimationAndRecording([heroImg, shopImg, checkoutImg, authImg]);
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

function startAnimationAndRecording(screens) {
  const [heroImg, shopImg, checkoutImg, authImg] = screens;
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
  });
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    await fetch('/save-reel', { method: 'POST', body: blob });
    console.log('Mobile feature reel saved successfully');
  };
  recorder.start();

  const totalDuration = 14; // 14 seconds
  const startTime = performance.now();

  function render(time) {
    const elapsed = (time - startTime) / 1000;
    const progress = Math.min(elapsed / totalDuration, 1);
    const t = elapsed;

    // Dark sleek gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0F0F14');
    bgGrad.addColorStop(0.5, '#16161F');
    bgGrad.addColorStop(1, '#0A0A0E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Glowing atmospheric background orbs
    ctx.save();
    const orb1 = ctx.createRadialGradient(180, 220 + Math.sin(t * 1.5) * 40, 20, 180, 220, 350);
    orb1.addColorStop(0, 'rgba(255, 77, 141, 0.28)');
    orb1.addColorStop(1, 'rgba(255, 77, 141, 0)');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, W, H);

    const orb2 = ctx.createRadialGradient(540, 950 + Math.cos(t * 1.2) * 50, 30, 540, 950, 400);
    orb2.addColorStop(0, 'rgba(157, 78, 221, 0.28)');
    orb2.addColorStop(1, 'rgba(157, 78, 221, 0)');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Top Header: Branding & Category
    ctx.save();
    ctx.textAlign = 'center';

    // Top Pill
    drawRoundedRect(ctx, W / 2 - 130, 50, 260, 34, 17);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FF4D8D';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('⚡ BUZZKO WEB ARCHITECTURE', W / 2, 72);

    // Main Catchy Heading
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('Full-Stack E-Commerce', W / 2, 126);
    ctx.font = '500 16px sans-serif';
    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('Next-Gen UI • Fluid Physics • WhatsApp Checkout', W / 2, 156);
    ctx.restore();

    // Smartphone / Device Frame Mockup
    const phW = 440;
    const phH = 750;
    const phX = (W - phW) / 2;
    const phY = 200;
    const phRadius = 36;

    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 25;

    // Phone Outer Body
    drawRoundedRect(ctx, phX, phY, phW, phH, phRadius);
    ctx.fillStyle = '#1C1C22';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2E2E38';
    ctx.stroke();

    // Inner Bezel Screen
    const screenMargin = 10;
    const sX = phX + screenMargin;
    const sY = phY + screenMargin;
    const sW = phW - screenMargin * 2;
    const sH = phH - screenMargin * 2;
    const sR = phRadius - 8;

    ctx.save();
    drawRoundedRect(ctx, sX, sY, sW, sH, sR);
    ctx.clip();
    ctx.fillStyle = '#0F0F12';
    ctx.fillRect(sX, sY, sW, sH);

    // Dynamic Island / Notch
    const notchW = 120;
    const notchH = 26;
    drawRoundedRect(ctx, phX + (phW - notchW) / 2, sY + 8, notchW, notchH, 13);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Top mini browser search bar inside phone
    drawRoundedRect(ctx, sX + 24, sY + 44, sW - 48, 28, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.font = '500 11px sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 surajit00007.github.io/Buzzko_website', sX + sW / 2, sY + 62);

    // Render screen inside viewport depending on timeline
    const screenContentY = sY + 82;
    const screenContentH = sH - 96;

    ctx.save();
    ctx.beginPath();
    ctx.rect(sX, screenContentY, sW, screenContentH);
    ctx.clip();

    let featureTitle = "";
    let featureBadge = "";
    let featureDetails = "";
    let activeColor = "#FF4D8D";
    let tapX = sX + sW / 2;
    let tapY = screenContentY + 150;
    let isTap = false;

    if (elapsed < 3.5) {
      // PHASE 1: Hero & Dynamic Floating Physics Charms
      featureBadge = "FEATURE 01";
      featureTitle = "Interactive Physics Stage";
      featureDetails = "Real-time tilt parallax & instant bag binding";
      activeColor = "#FF4D8D";

      const p1 = elapsed / 3.5;
      const zoom = 1.15;
      const panX = Math.sin(t * 1.5) * 20;
      const panY = Math.cos(t * 1.5) * 15;
      ctx.drawImage(heroImg, 0, 0, 1280, 900, sX - 100 - panX, screenContentY - panY, sW * 1.8, (sW * 1.8 / 1280) * 900);

      tapX = sX + 160 + Math.sin(t * 2) * 50;
      tapY = screenContentY + 200 + Math.cos(t * 2) * 30;
      isTap = Math.sin(t * 5) > 0.8;

    } else if (elapsed < 7.0) {
      // PHASE 2: Filterable Cloud Catalogue
      featureBadge = "FEATURE 02";
      featureTitle = "Live Cloud Catalogue";
      featureDetails = "Filter chips, OfferStrip & derived discounts";
      activeColor = "#FBBF24";

      const p2 = (elapsed - 3.5) / 3.5;
      const scrollY = Math.min(p2 * 260, 260);
      ctx.drawImage(shopImg, 0, 0, 1280, 900, sX - 40, screenContentY - scrollY, sW * 1.25, (sW * 1.25 / 1280) * 900);

      tapX = sX + 180;
      tapY = screenContentY + 95;
      isTap = Math.sin(t * 6) > 0.85;

    } else if (elapsed < 10.5) {
      // PHASE 3: Zod-Validated WhatsApp Order Handoff
      featureBadge = "FEATURE 03";
      featureTitle = "Zero-Friction WhatsApp Checkout";
      featureDetails = "Strict Indian PIN/phone validation + 1-click WA";
      activeColor = "#22C55E";

      const p3 = (elapsed - 7.0) / 3.5;
      ctx.drawImage(checkoutImg, 0, 0, 1280, 900, sX - 50, screenContentY - 30, sW * 1.3, (sW * 1.3 / 1280) * 900);

      tapX = sX + sW / 2;
      tapY = screenContentY + 410;
      isTap = Math.sin(t * 5) > 0.8;

    } else {
      // PHASE 4: Studio Auth & Static Architecture
      featureBadge = "FEATURE 04";
      featureTitle = "Role-Gated Studio & SSR Build";
      featureDetails = "PostgreSQL RLS security + 100% Static GitHub Pages";
      activeColor = "#06B6D4";

      ctx.drawImage(authImg, 0, 0, 1280, 900, sX - 60, screenContentY, sW * 1.35, (sW * 1.35 / 1280) * 900);

      tapX = sX + sW / 2;
      tapY = screenContentY + 280;
      isTap = Math.sin(t * 4) > 0.8;
    }

    // Interactive Tap Pulse Indicator
    if (isTap) {
      ctx.save();
      ctx.fillStyle = activeColor;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(tapX, tapY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(tapX, tapY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // end screen clip

    // Bottom Home Indicator Bar
    drawRoundedRect(ctx, phX + (phW - 140) / 2, sY + sH - 12, 140, 5, 2.5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    ctx.restore(); // end phone frame clip
    ctx.restore(); // end phone shadow

    // Bottom Floating Feature Callout Card
    const cardW = 600;
    const cardH = 170;
    const cardX = (W - cardW) / 2;
    const cardY = 980;

    ctx.save();
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 22);
    ctx.fillStyle = '#18181F';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#272732';
    ctx.stroke();

    // Top color strip
    drawRoundedRect(ctx, cardX, cardY, cardW, 4, 2);
    ctx.fillStyle = activeColor;
    ctx.fill();

    // Badge
    drawRoundedRect(ctx, cardX + 28, cardY + 22, 110, 26, 13);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.fillStyle = activeColor;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(featureBadge, cardX + 83, cardY + 39);

    // Feature Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(featureTitle, cardX + 28, cardY + 80);

    // Feature Details
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '400 15px sans-serif';
    ctx.fillText(featureDetails, cardX + 28, cardY + 112);

    // Bottom Footer in Card: Tech Pills
    const pills = ['TanStack Start', 'React 19', 'Tailwind CSS v4', 'Supabase'];
    pills.forEach((pill, i) => {
      const px = cardX + 28 + i * 135;
      const py = cardY + 130;
      drawRoundedRect(ctx, px, py, 125, 24, 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.fillStyle = '#E4E4E7';
      ctx.font = '500 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pill, px + 62, py + 16);
    });

    ctx.restore();

    // Bottom Live Website URL CTA
    ctx.save();
    drawRoundedRect(ctx, (W - 460) / 2, 1180, 460, 44, 22);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.fillStyle = '#0F0F14';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔗 surajit00007.github.io/Buzzko_website', W / 2, 1207);
    ctx.restore();

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
  } else if (req.method === "POST" && req.url === "/save-reel") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const outPublic = path.join(publicDir, "buzzko-feature-reel.webm");
      const outAssets = path.join(rootDir, "Assets", "buzzko-feature-reel.webm");

      fs.writeFileSync(outPublic, buffer);
      fs.writeFileSync(outAssets, buffer);

      console.log(`Website feature mobile reel saved: ${outPublic} (${buffer.length} bytes)`);
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

server.listen(9878, () => {
  console.log("Website feature reel server listening at http://localhost:9878");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--window-size=720,1280",
    "http://localhost:9878"
  ]);

  edge.on("error", (err) => {
    console.error("Failed to spawn Edge:", err);
    server.close();
    process.exit(1);
  });
});
