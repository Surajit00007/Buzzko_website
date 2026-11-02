# 🐝 buzzko — Modern Full-Stack E-Commerce Website

> **A high-performance, statically prerendered e-commerce storefront engineered with TanStack Start, React 19, Tailwind CSS v4, and Supabase.**

[![Live Storefront](https://img.shields.io/badge/Live_Storefront-GitHub_Pages-22c55e?style=for-the-badge&logo=github)](https://surajit00007.github.io/Buzzko_website/)
[![Release v1.1](https://img.shields.io/badge/Release-v1.1-ec4899?style=for-the-badge)](https://github.com/Surajit00007/Buzzko_website/releases/tag/v1.1)
[![Build & Deploy](https://img.shields.io/badge/Deployment-GitHub_Actions_Passed-06b6d4?style=for-the-badge&logo=githubactions)](https://github.com/Surajit00007/Buzzko_website/actions)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start_%26_Router-FF4154?style=for-the-badge)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## 🌐 Live Storefront

The live storefront is deployed and accessible on GitHub Pages:
**[https://surajit00007.github.io/Buzzko_website/](https://surajit00007.github.io/Buzzko_website/)**

<p align="center">
  <img src="public/preview-live-site.png" alt="Buzzko Live Storefront on GitHub Pages" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.18);" />
</p>

---

## 🖥️ Website & Features Walkthrough Demo

A walkthrough demonstrating the desktop experience, interactive physics charm stage, dynamic bag drawer, and WhatsApp order handoff:

<p align="center">
  <img src="public/buzzko-website-demo.gif" alt="Buzzko Feature Walkthrough Demo" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);" />
</p>

---

## 📸 Website Previews & Screenshots

### 1. Interactive Physics Charm Stage (Hero)
An interactive floating charm stage with pointer parallax, real-time depth perspective, responsive asymmetric layout slots, and instant 1-click bag binding.

<p align="center">
  <img src="public/preview-hero.png" alt="Buzzko Interactive Storefront Hero" width="94%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

---

### 2. Zod-Validated WhatsApp Checkout Workflow
Zero-friction checkout flow featuring strict client-side validation (Indian mobile numbers, 6-digit postal PIN codes, state, and address), cash-on-delivery preferences, and an automated handoff that generates a pre-formatted itemised WhatsApp order message.

<p align="center">
  <img src="public/preview-checkout.png" alt="Buzzko Checkout Workflow" width="94%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

---

### 3. Admin Studio & Secure Cloud Infrastructure
Protected management portal backed by PostgreSQL Row Level Security (RLS) policies, private cloud bucket signed URLs, and admin role isolation ensuring public visitors cannot mutate catalogue state.

<p align="center">
  <img src="public/preview-auth.png" alt="Buzzko Studio Portal" width="75%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
</p>

---

## ⚡ Core Website & Architecture Features

| Feature | Technical Implementation | Benefit |
| :--- | :--- | :--- |
| **Interactive Physics Stage** | Dynamic CSS 3D transforms, mouse/touch tracking, fluid viewport units | Engaging sensory micro-interactions without heavy WebGL bundles |
| **Reactive Bag Drawer** | React Context + LocalStorage sync + animated Sonner toasts | Frictionless 1-click bag additions that persist across sessions |
| **Smart Price Normalization** | Shared pricing helpers (`sellingPrice`, `bagSubtotal`, `savings`) | Consistent discounts, strikethrough pricing, and bag totals |
| **WhatsApp Order Handoff** | Shared order helper + WhatsApp click-to-chat URL encoder | Immediate conversion without third-party payment gateway fees |
| **Strict Form Validation** | Zod schema validation for Indian phones, PIN codes & shipping details | Prevents malformed orders and eliminates delivery failure rates |
| **Static SSR Prerendering** | TanStack Start crawler + Nitro static prerender + GitHub Pages | Blazing-fast TTFB, zero server hosting costs, 100% SEO indexability |
| **Database Security (RLS)** | Supabase PostgreSQL with protected `user_roles` table | Defense-in-depth: writes enforced at the database level |

---

## 🛠️ Tech Stack & Tooling

- **Core Framework**: [TanStack Start](https://tanstack.com/start) with static prerendering (`prerender: { enabled: true }`)
- **Routing**: [TanStack Router](https://tanstack.com/router) with strict type safety and subpath basepath routing
- **UI Engine**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4, Lucide React icons, and Radix UI dialog primitives
- **Typography**: Fredoka (chunky playful headers) & Figtree (clean ergonomic body text)
- **Backend & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Storage)
- **Testing**: Vitest + React Testing Library (27/27 unit & integration tests passing)
- **CI / CD**: GitHub Actions deploying automatically to GitHub Pages (`gh-pages` branch)

---

## 💻 Local Development & Testing

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Surajit00007/Buzzko_website.git
   cd Buzzko_website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:8080` in your browser.

4. **Run unit tests:**
   ```bash
   npm run test
   ```

5. **Build and prerender static pages:**
   ```bash
   npm run build
   ```

---

## 🚀 Live Links & Socials

- 🌐 **Live Website**: [https://surajit00007.github.io/Buzzko_website/](https://surajit00007.github.io/Buzzko_website/)
- 📦 **GitHub Releases**: [v1.1 Release Notes](https://github.com/Surajit00007/Buzzko_website/releases/tag/v1.1)
- 📸 **Instagram**: [@buzz.ko](https://www.instagram.com/buzz.ko/)
- 💬 **WhatsApp Store**: [+91 9625924179](https://wa.me/919625924179)
