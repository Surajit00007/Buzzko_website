import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.resolve(rootDir, "public");

// Read product showcase images as base64 to embed in the canvas
const img1 = fs.readFileSync(path.join(publicDir, "product-showcase-1.jpg")).toString("base64");
const img2 = fs.readFileSync(path.join(publicDir, "product-showcase-2.jpg")).toString("base64");
const img3 = fs.readFileSync(path.join(publicDir, "product-showcase-3.jpg")).toString("base64");
const img4 = fs.readFileSync(path.join(publicDir, "product-showcase-4.jpg")).toString("base64");

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Buzzko Promo Video Generator</title>
  <style>
    body { margin: 0; background: #111; display: grid; place-items: center; min-height: 100vh; overflow: hidden; }
    canvas { width: 720px; height: 1280px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
<canvas id="c" width="720" height="1280"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// Load images
function loadImg(b64) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.src = 'data:image/jpeg;base64,' + b64;
  });
}

Promise.all([
  loadImg("${img1}"),
  loadImg("${img2}"),
  loadImg("${img3}"),
  loadImg("${img4}")
]).then(([p1, p2, p3, p4]) => {
  startAnimationAndRecording([p1, p2, p3, p4]);
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

function startAnimationAndRecording(products) {
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
  });
  const chunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    await fetch('/save-video', { method: 'POST', body: blob });
    console.log('Video saved successfully');
  };
  recorder.start();

  const totalDuration = 11; // 11 seconds
  const startTime = performance.now();

  function render(time) {
    const elapsed = (time - startTime) / 1000;
    const progress = Math.min(elapsed / totalDuration, 1);

    // Dynamic background with brand gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FFF5F8');
    bgGrad.addColorStop(0.5, '#F5F3FF');
    bgGrad.addColorStop(1, '#F0FDF4');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative floating blobs
    const t = elapsed;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 182, 193, 0.45)';
    ctx.beginPath();
    ctx.arc(100 + Math.sin(t * 1.5) * 40, 200 + Math.cos(t * 1.2) * 30, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(196, 181, 253, 0.45)';
    ctx.beginPath();
    ctx.arc(620 + Math.cos(t * 1.3) * 40, 450 + Math.sin(t * 1.4) * 30, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(190, 242, 100, 0.4)';
    ctx.beginPath();
    ctx.arc(150 + Math.sin(t * 1.1) * 30, 1100 + Math.cos(t * 1.5) * 40, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Scene sequencing
    // Scene 1 (0 to 3s): Brand intro + floating letters
    // Scene 2 (3s to 6s): Products Showcase
    // Scene 3 (6s to 8.5s): Mega deal / COD / Free Shipping
    // Scene 4 (8.5s to 11s): Call to action WhatsApp & Instagram

    // Header Wordmark always present at top
    ctx.save();
    ctx.translate(W / 2, 140);
    const letters = ['b', 'u', 'z', 'z', 'k', 'o'];
    const tones = ['#FF4D8D', '#9D4EDD', '#84CC16', '#FF4D8D', '#06B6D4', '#FBBF24'];
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw letters with pop animation
    const spacing = 58;
    const startX = -((letters.length - 1) * spacing) / 2;
    letters.forEach((char, i) => {
      const charOffset = Math.sin(t * 3.5 + i * 0.7) * 8;
      const lx = startX + i * spacing;
      const ly = charOffset;
      ctx.fillStyle = tones[i];
      ctx.fillText(char, lx, ly);
      // Drop shadow for chunky feel
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#18181B';
      ctx.strokeText(char, lx, ly);
      ctx.fillText(char, lx, ly);
    });

    ctx.font = '600 24px sans-serif';
    ctx.fillStyle = '#71717A';
    ctx.fillText('keychains  •  phone charms  •  frames', 0, 70);
    ctx.restore();

    if (elapsed < 3.2) {
      // SCENE 1: Brand Intro
      const s1Progress = Math.min(elapsed / 2.8, 1);
      const scale = 0.8 + Math.min(s1Progress * 0.25, 0.2);

      ctx.save();
      ctx.translate(W / 2, 600);
      ctx.scale(scale, scale);

      // Hero image card
      drawRoundedRect(ctx, -260, -260, 520, 520, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 15;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();

      // Clip image
      ctx.save();
      drawRoundedRect(ctx, -240, -240, 480, 480, 28);
      ctx.clip();
      ctx.drawImage(products[0], -240, -240, 480, 480);
      ctx.restore();

      // Badge over image
      ctx.save();
      ctx.translate(160, 220);
      ctx.rotate(-0.1);
      drawRoundedRect(ctx, -130, -32, 260, 64, 32);
      ctx.fillStyle = '#FBBF24';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();
      ctx.fillStyle = '#18181B';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨ Handcrafted ✨', 0, 2);
      ctx.restore();

      ctx.restore();

      // Subtitle
      ctx.save();
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.textAlign = 'center';
      ctx.fillText('Tiny Objects With Big Personality', W / 2, 980);
      ctx.font = '500 24px sans-serif';
      ctx.fillStyle = '#71717A';
      ctx.fillText('Made in small batches • 100% Glossy finish', W / 2, 1030);
      ctx.restore();

    } else if (elapsed < 6.8) {
      // SCENE 2: 4 Products Showcase Grid
      const s2Time = elapsed - 3.2;
      ctx.save();
      ctx.font = 'bold 42px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.textAlign = 'center';
      ctx.fillText('Cute New Charms Just Dropped 💕', W / 2, 300);

      const items = [
        { img: products[0], name: 'Bubble Heart', tag: '₹149', col: 0, row: 0, tone: '#FF4D8D' },
        { img: products[1], name: 'Daisy Pop', tag: '₹149', col: 1, row: 0, tone: '#FBBF24' },
        { img: products[2], name: 'Lucky Star', tag: '₹149', col: 0, row: 1, tone: '#84CC16' },
        { img: products[3], name: 'Smiley Club', tag: '₹149', col: 1, row: 1, tone: '#06B6D4' }
      ];

      items.forEach((item, idx) => {
        const itemDelay = idx * 0.15;
        const itemProgress = Math.max(0, Math.min((s2Time - itemDelay) * 3, 1));
        const cx = 200 + item.col * 320;
        const cy = 480 + item.row * 320;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(itemProgress, itemProgress);

        // Card bg
        drawRoundedRect(ctx, -140, -140, 280, 280, 28);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#18181B';
        ctx.stroke();

        // Image
        ctx.save();
        drawRoundedRect(ctx, -125, -125, 250, 200, 20);
        ctx.clip();
        ctx.drawImage(item.img, -125, -125, 250, 200);
        ctx.restore();

        // Name & price tag
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#18181B';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, -120, 110);

        // Price chip
        drawRoundedRect(ctx, 40, 88, 80, 32, 16);
        ctx.fillStyle = item.tone;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#18181B';
        ctx.stroke();
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#18181B';
        ctx.textAlign = 'center';
        ctx.fillText(item.tag, 80, 108);

        ctx.restore();
      });
      ctx.restore();

    } else if (elapsed < 9.2) {
      // SCENE 3: Mega Keychain Deal ₹149 + COD
      const pulse = 1 + Math.sin(t * 6) * 0.04;

      ctx.save();
      ctx.translate(W / 2, 540);
      ctx.scale(pulse, pulse);

      // Huge promo container
      drawRoundedRect(ctx, -310, -220, 620, 440, 36);
      ctx.fillStyle = '#FBBF24';
      ctx.shadowColor = 'rgba(255, 77, 141, 0.4)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 14;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();

      ctx.fillStyle = '#FF4D8D';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 LIMITED TIME DROP 🔥', 0, -140);

      ctx.font = 'bold 64px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.fillText('ALL KEYCHAINS', 0, -60);

      ctx.font = 'bold 110px sans-serif';
      ctx.fillStyle = '#FF4D8D';
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#18181B';
      ctx.strokeText('AT ₹149', 0, 50);
      ctx.fillText('AT ₹149', 0, 50);

      // COD badge
      drawRoundedRect(ctx, -190, 105, 380, 60, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();

      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.fillText('🚚 Cash On Delivery Available', 0, 142);
      ctx.restore();

      // Free shipping badge
      ctx.save();
      ctx.translate(W / 2, 860);
      drawRoundedRect(ctx, -260, -40, 520, 80, 40);
      ctx.fillStyle = '#84CC16';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();

      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ FREE Shipping across India over ₹999', 0, 8);
      ctx.restore();

    } else {
      // SCENE 4: Call to action (WhatsApp + Instagram)
      ctx.save();
      ctx.translate(W / 2, 520);

      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.textAlign = 'center';
      ctx.fillText('Ready To Order? ✨', 0, -120);

      // WhatsApp Big Button
      const waPulse = 1 + Math.sin(t * 8) * 0.03;
      ctx.save();
      ctx.scale(waPulse, waPulse);
      drawRoundedRect(ctx, -280, -50, 560, 100, 50);
      ctx.fillStyle = '#25D366';
      ctx.shadowColor = 'rgba(37, 211, 102, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();

      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('💬 Order on WhatsApp', 0, 10);
      ctx.restore();

      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#18181B';
      ctx.fillText('+91 9625924179', 0, 100);

      // Instagram card
      ctx.save();
      ctx.translate(0, 220);
      drawRoundedRect(ctx, -240, -40, 480, 80, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#18181B';
      ctx.stroke();

      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#E1306C';
      ctx.fillText('📸 Follow @buzz.ko', 0, 8);
      ctx.restore();

      // Web link
      ctx.font = '600 24px sans-serif';
      ctx.fillStyle = '#71717A';
      ctx.fillText('surajit00007.github.io/Buzzko_website', 0, 360);

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
      const outPublic = path.join(publicDir, "buzzko-promo.webm");
      const outAssets = path.join(rootDir, "Assets", "buzzko-promo.webm");

      fs.writeFileSync(outPublic, buffer);
      fs.writeFileSync(outAssets, buffer);

      console.log(`Video generated successfully: ${outPublic} (${buffer.length} bytes)`);
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

server.listen(9876, () => {
  console.log("Video recording server listening at http://localhost:9876");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const edge = spawn(edgePath, [
    "--headless=new",
    "--disable-gpu",
    "--window-size=720,1280",
    "http://localhost:9876"
  ]);

  edge.on("error", (err) => {
    console.error("Failed to spawn Edge:", err);
    server.close();
    process.exit(1);
  });
});
