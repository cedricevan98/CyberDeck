# ⚡ CyberDeck

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Zero%20Runtime%20Deps-brightgreen?style=flat-square" alt="Zero deps" />
  <img src="https://img.shields.io/badge/100%25%20Client--Side-privacy--first-blue?style=flat-square" alt="Client-side" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT" />
</p>

<p align="center">
  <strong>The Security Engineer's browser-based toolkit.</strong><br/>
  6 essential tools. Zero backend. Fully offline-capable. Nothing ever leaves your device.
</p>

---

## 🧰 Tools

| Tool | What it does |
|------|-------------|
| **🔑 JWT Inspector** | Decode header, payload & signature · Expiry status · Claims table · Supports HS/RS/ES/PS variants |
| **#️⃣ Hash Generator** | SHA-1, SHA-256, SHA-384, SHA-512 via native Web Crypto API |
| **🔐 Encoder / Decoder** | Base64 · URL encoding · Hex · HTML Entities |
| **🛡️ Password Analyzer** | Shannon entropy · Crack-time estimate (100B guesses/sec) · NIST SP 800-63B checklist |
| **🌐 CIDR Calculator** | Network/broadcast/host range |
| **🔍 Regex Tester** | Live match highlighting with 12 security presets |

---

## 🚀 Quick Start

```bash
git clone https://github.com/cedricevan98/CyberDeck.git
cd CyberDeck
npm install
npm run dev
```

Open [http://localhost:5173/CyberDeck/](http://localhost:5173/CyberDeck/)

### Build for production

```bash
npm run build
npm run preview
```

---

## 🔒 Privacy by Design

All hashing, encoding, and analysis runs locally via the browser's native Web Crypto API - no network calls, no analytics, no third-party libraries. Works fully offline after the first load.

---

## 🏗️ Architecture

**Tech choices:**
- React 18 hooks-only SPA (no class components, no Redux)
- Vite 5 (fast HMR in dev, optimized builds)
- Zero runtime dependencies beyond React
- Web Crypto API for browser-native cryptographic primitives
- CSS variables for full dark theme without a UI framework

---

## 🤝é Contributing

Pull requests welcome.

---

## 📄 License

MIT | Cedric Evan
