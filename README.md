# 🎥 YouTube Stream Scraper (In Progress)

A high-performance **TypeScript + Playwright** scraping engine that streams YouTube metadata in real-time using **memory-efficient Async Generators**.

Designed for scalability, low memory usage, and reliable extraction from YouTube’s dynamic UI.

---

## 🚀 Features

### ⚡ Memory Efficient
Uses **Async Generators** to stream results progressively instead of storing everything in memory.

### 🔄 Resilient Extraction
Implements adaptive scrolling to handle YouTube’s infinite loading and dynamic DOM updates.

### 🧠 Type Safe
Built with **TypeScript** to enforce strict typing across:
- Videos
- Shorts
- Podcasts

### 📊 Data Normalization
Automatically converts values like:
- `1.2K → 1200`
- `3.4M → 3400000`

### 🖥 Headless Performance
Optimized for fast, background execution using **Playwright (Chromium)**.

---

## 🧩 Supported Categories

- `basic_info`
- `video`
- `shorts`
- `podcast`

---

## 🛠 Tech Stack

- TypeScript
- Node.js
- Playwright
- ES2020 modules

---

## 🔧 Installation

### 1️⃣ Clone repository

```bash
git clone https://github.com/yshail/youtube-stream-scraper.git
cd youtube-stream-scraper
