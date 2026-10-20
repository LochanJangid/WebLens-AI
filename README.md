# WebLens AI 🌐🔍

> **Production-Grade AI Website Intelligence & Screenshot-Driven Visual Improvement Studio**  
> *Built by **[Lochan Jangid](https://lochan.vercel.app/)** (AI/ML Engineer)*  
> *100% Free Forever for all developers & creators — Zero paywalls, zero friction.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-2EAD33.svg?logo=playwright)](https://playwright.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-F20D4F.svg?logo=tailwind-css)](https://tailwindcss.com)

---

## 🌟 Overview

**WebLens AI** is a developer platform that transforms websites from average to product-grade. Inspired directly by its signature emblem—an archer standing on rugged peaks—WebLens AI delivers precision targeting, technical depth, and deep visual intelligence to identify weaknesses others overlook.

Instead of generic mockups or vague advice, WebLens AI extracts exact visual coordinates on real screenshots, measures Core Web Vitals, and crafts state-of-the-art vision prompts for **Claude 3.7 / 3.5 Sonnet**, **OpenAI GPT-4o Vision**, **Cursor Composer**, **Windsurf**, and **Antigravity**.

---

## 🎨 Brand Identity & Design System

WebLens AI features a custom cinematic, high-contrast design language built around the official brand emblem (`logo.png` & `favicon.png`):

- **Obsidian Palette:** `#050505` (primary canvas), `#0B0B0D` (elevated surface), `#111114` (secondary cards), `#17171B` (raised interactive controls).
- **Signature Crimson Accent:** `#F20D4F` (primary interactive), `#FF245F` (hover glow), `rgba(242, 13, 79, 0.12)` (soft ambient tint).
- **High-Contrast Typography:** `#F7F7F8` (headings & body), `#B4B4BD` (secondary metadata), `#777781` (muted labels).
- **Symbolism:** Precision reticles (archer's aim) on rugged terrain vectors (mountain peaks).

---

## 🚀 Key Features

### 1. 📸 Screenshot-Based AI Visual Improvement Studio (Star Feature)
- **Direct Screenshot-to-LLM Pipeline:** Download crisp full-resolution viewport or full-page PNG captures with one click, or upload your own screenshots directly from `localhost:3000`, staging servers, or Figma designs.
- **Multimodal AI Vision Prompts:** Ready-to-paste prompts calibrated for:
  - **Claude 3.7 / 3.5 Sonnet Vision:** Deep aesthetic judgment, design system consistency, and clean JSX.
  - **OpenAI GPT-4o Vision:** Conversion rate optimization (CRO), eye-path routing, and high-impact hero restructuring.
  - **Cursor Composer / Windsurf / Antigravity:** Zero-breaking-change coding agent prompts with strict file preservation constraints.
  - **v0.dev / Bolt.new:** Single-prompt generative UI replacement using Tailwind CSS and Lucide icons.
- **60-30-10 Design System Engine:** Automatically recommends a modern, accessible color palette (60% background, 30% card surface, 10% conversion accent) with 1-click copy hex codes.
- **Production React + Tailwind Code:** Instantly preview and copy a modernized, accessible component.

### 2. ⚡ Interactive Code Transformer (Preserved Content)
- Paste your existing React JSX/TSX, HTML, or CSS markup into the Code Transformer.
- WebLens AI upgrades visual hierarchy, touch targets (≥48px), and responsive mobile layout while preserving **100% of your exact text, copy, and call-to-actions**.

### 3. 🤖 Global WebLens AI Assistant on Every Page
- Dedicated assistant accessible everywhere from the top Navbar and floating launcher in **one unified state**.
- Conversation history is automatically preserved across page navigations with full awareness of active audit findings.

### 4. 🎯 Evidence-First DOM & Performance Auditing
- **Playwright Chromium Measurement:** Measures exact bounding box pixel coordinates (`x`, `y`, `width`, `height`) for audited elements.
- **Core Web Vitals:** Measures Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Total Blocking Time (TBT).
- **Accessibility & SEO Verification:** WCAG 2.1 AA color contrast validation, heading structure hierarchy (`h1` → `h2` → `h3`), missing image alt attributes, and link label clarity.
- **Zero Hallucination Level 1 Templates:** Common violations are explained with deterministic zero-token templates for instant load times and zero API latency.

### 5. 📄 Executive Report Export & Browser History
- Download a clean Markdown executive summary report with one click.
- Browser storage persistence (no account required) preserves audit sessions, chat history, and visual snapshots locally for 7 days.

---

## 🗺️ Production-Grade Roadmap

### Phase 1: Web Platform Production Deployment (Current)
- [x] Obsidian & crimson cinematic theme implementation (`#050505` + `#F20D4F`).
- [x] Official `logo.png` & `favicon.png` asset integration across metadata and UI.
- [x] Next.js 14 App Router static build optimization (100% pass on all routes).
- [x] Playwright headless crawler with coordinate-mapped visual reticles.
- [x] Groq LLM integration with deterministic client fallbacks.
- [x] Multi-model vision prompt generator (Claude 3.7, GPT-4o, Cursor, Windsurf, Antigravity).
- [x] 100% Free forever open-access model (zero paywalls, no credits, no subscription tiers).
- [ ] Vercel edge deployment with automated preview branches.
- [ ] Docker containerized deployment (`Dockerfile` + `docker-compose.yml`) for self-hosted instances.

### Phase 2: Chrome Extension Production Launch
- [ ] **Manifest V3 Extension:** Lightweight Chrome extension for 1-click in-browser auditing.
- [ ] **Chrome Web Store Submission:**
  - Automated manifest bundle packaging (`zip`).
  - Privacy policy declaration (zero user data exfiltration).
  - Web store screenshot showcase and icon assets (`16x16`, `48x48`, `128x128`).
- [ ] **Direct Tab Bridge:** Capture visible tab screenshots (`chrome.tabs.captureVisibleTab`) and forward directly to WebLens AI Studio without requiring server crawling.
- [ ] **Local Storage Bridge:** Sync extension findings directly into WebLens AI workspace.

---

## 🏗️ Architecture

```
WebLensAI
├── frontend/                  # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── src/app/              # / (Landing), /audit (Workspace), /audit/inspect (Visual Studio)
│   ├── src/components/
│   │   ├── studio/           # ScreenshotVisionStudio, CodeTransformer, Chatbot
│   │   ├── audit/            # VisualAuditWorkspace, SimpleIssueCard, AgentPromptTab
│   │   ├── assistant/        # GlobalAssistant drawer & launcher
│   │   ├── layout/           # Navbar, Footer, CreatorCredits
│   │   └── ui/               # ScoreGauge, MetricCard, WebLensLogo
│   ├── src/services/         # api.ts, intelligence.ts, redesign.ts, storage.ts
│   └── tests/                # Node.js native test runner test suite (26 tests)
│
├── backend/                   # FastAPI, Python 3.11+, Pydantic v2
│   ├── app/
│   │   ├── routers/          # audit.py, chat.py, visual_improve.py
│   │   ├── services/         # screenshot_ai.py, visual.py, inspector.py, rules.py, llm.py
│   │   ├── config.py         # App configuration & Groq/Lighthouse settings
│   │   └── schemas.py        # Strict Pydantic models & validation
│   └── requirements.txt      # FastAPI, Playwright, Groq, BeautifulSoup4, httpx
```

---

## ⚡ Quickstart

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (Playwright Chromium)

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

Configure environment (optional, operates with deterministic fallbacks when offline):
```bash
cp .env.example .env
# Add GROQ_API_KEY (optional for Groq cloud enrichment)
# Add PSI_API_KEY (optional for Google PageSpeed Insights)
```

Run FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Running Test Suites
```bash
cd frontend
npm test
```
All 26 unit tests execute cleanly.

---

## 👨‍💻 Creator & Maintainer

**WebLens AI** was designed and engineered by **Lochan Jangid**.

- 🌐 **Portfolio:** [lochan.vercel.app](https://lochan.vercel.app/)
- 🐙 **GitHub:** [@LochanJangid](https://github.com/LochanJangid)
- 💼 **LinkedIn:** [linkedin.com/in/lochan-jangid](https://www.linkedin.com/in/lochan-jangid/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Run FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Running Test Suites
```bash
cd frontend
npm test
```
All 26 unit tests covering intelligence grouping, DOM normalizers, redesign generation, screenshot AI prompts, and storage persistence will execute cleanly.

---

## 👨‍💻 Creator & Maintainer

**WebLensAI** was designed and engineered by **Lochan Jangid**.

- 🌐 **Portfolio:** [lochan.vercel.app](https://lochan.vercel.app/)
- 🐙 **GitHub:** [@LochanJangid](https://github.com/LochanJangid)
- 💼 **LinkedIn:** [linkedin.com/in/lochan-jangid](https://www.linkedin.com/in/lochan-jangid/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
