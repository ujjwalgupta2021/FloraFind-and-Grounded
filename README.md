*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

# 🍀 FloraFind & Grounded

## What I Built

**FloraFind & Grounded** is a gamified single-page web application (SPA) designed to solve a universal developer problem: terminal fatigue, continuous debugging burn-out, and excessive screen time. Built specifically for Week 1 of the **Hacktoberfest 2026 DEV Challenge ("Touch Grass")**, this project turns stepping away from the desk into an interactive, rewarding outdoor quest.

### 🌟 Key Highlights:

1. **🌿 "Screen-Time Detox" Quest Engine**:
   - Generates real-world outdoor challenges (*"Inspect Sidewalk Chlorophyll"*, *"Locate 3-Leaf Hardware Redundancy"*, *"Deep Canopy Sunlight Audit"*).
   - Category filtering (*Quick 5-Min*, *Flora Scavenger*, *Deep Forest Debug*).
   - Logs outdoor uptime minutes, Grass XP points, and levels upon completion.

2. **🤖 Cloud Open Innovation AI Identifier ("FloraFind")**:
   - Accepts both natural language plant descriptions and direct leaf photo uploads via camera/file picker.
   - Communicates with Google AI Studio open-weight models (**Gemma 2** and **Gemini Flash**).
   - Compiles plants into hilarious developer-centric botanical specifications (*Hardware Redundancy*, *Photosynthesis SLA*, *Developer Patch Notes*).
   - Features an **Interactive Percentage Loader** with dynamic 6-step ticker and anti-freeze timeouts.
   - Includes an **Offline Simulator Fallback** mode if no API key is provided or network is offline.

3. **📊 Outdoor Uptime & Streak Dashboard**:
   - Tracks total outdoor minutes, active daily streaks, quests completed, and plant scans logged.
   - Unlockable **Developer Grass Badges** (*Seedling Debugger*, *Touch Grass Protocol*, *Solar Streak*, *Quantum Photosynthesis*).
   - Light & Dark mode theme engine with dynamic toggle.
   - 100% persisted locally in browser `LocalStorage`.

4. **🔒 Privacy-First Client Architecture**:
   - No hardcoded API keys. User keys are stored **only** in the browser's `LocalStorage`.
   - Direct HTTPS requests to Google AI Studio with zero intermediary backend servers.

---

## Demo

🚀 **Live Application Demo**:  
[https://ujjwalgupta2021.github.io/FloraFind-and-Grounded/](https://ujjwalgupta2021.github.io/FloraFind-and-Grounded/)

---

## Code

💻 **GitHub Repository**:  
[https://github.com/ujjwalgupta2021/FloraFind-and-Grounded](https://github.com/ujjwalgupta2021/FloraFind-and-Grounded)

```
├── index.html   # Main SPA layout, quest board, AI analyzer UI, theme engine & modal
├── style.css    # Custom scrollbars, glassmorphism, animations & theme overrides
├── app.js       # App state engine, Google AI Studio integration, AbortController timeouts
└── README.md    # Official DEV Challenge submission document
```

---

## How I Built It

### 🧠 Open-Source & Open-Weight AI Architecture

This application is built around Google AI Studio's open model endpoints, featuring **Google's Gemma open-weight series** (`gemma-2-27b-it`, `gemma-2-9b-it`) and fast multimodal models (`gemini-2.0-flash`, `gemini-1.5-flash`).

1. **Automated Connection & Model Securer**:
   - When a user inputs an API key, the app calls `ModelService.ListModels` (`https://generativelanguage.googleapis.com/v1beta/models`) to discover authorized models.
   - It runs an automated priority candidate test sweep to lock in a guaranteed 200 OK connection without requiring users to navigate complex dropdown settings.

2. **AbortController Timeout Engine**:
   - Built a custom `fetchWithTimeout()` wrapper with an optimal 19-second master deadline and 19-second direct fetch budget.
   - Prevents browser requests from hanging indefinitely on slow or unresponsive endpoints.

3. **Frontend Stack**:
   - **Core**: Vanilla HTML5, Modern Modular JavaScript (ES6+)
   - **Styling**: Tailwind CSS (Play CDN) + Vanilla CSS Glassmorphism & Keyframe Animations
   - **Icons**: Lucide Icons
   - **State Persistence**: Browser `LocalStorage`

---

## Why Does Open Innovation Matter?

Open innovation and open-weight models (such as Google's **Gemma** family) are fundamental to the future of software development:

1. **Transparency & Sovereignty**: Open-weight models give developers full visibility into model behavior and parameter architectures, removing black-box dependency on proprietary closed APIs.
2. **Client-Side Privacy Architecture**: Open endpoints allow applications like *FloraFind* to construct direct, peer-to-endpoint calls straight from the user's browser, enabling privacy-first architectures where user keys and personal data stay client-side.
3. **Unlocking Creative Developer Tooling**: Open innovation allows developers to build specialized, niche AI experiences—like compiling real-world plants into hilarious developer SLA patch notes—without prohibitive licensing or API lock-in constraints.

---

## My Agent Session

This application was planned, architected, and built with the assistance of an autonomous agent swarm using **Antigravity 2.0**.

---

## Prize Categories

- **🏆 Grand Prize / Open Innovation Track**: Best application leveraging open-weight AI models (Google Gemma / AI Studio).
- **🌿 Touch Grass Week 1 Theme Track**: Best project encouraging physical outdoor interaction, screen-time detox, and real-world exploration.

---

*Built with 💚 for the Hacktoberfest 2026 Week 1 DEV Challenge — Go Touch Grass!*
