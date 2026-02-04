YouTube Stream Scraper (In Progress)
A high-performance TypeScript and Playwright engine designed to stream YouTube metadata using memory-efficient Async Generators.

🎯 Engineering Goals
Memory Efficiency: Use AsyncGenerators to yield data in real-time, avoiding high memory overhead for large channels.

Resilient Extraction: Implement adaptive scrolling to handle YouTube's dynamic infinite-loading DOM.

Type Safety: Ensure strict data integrity across Videos, Shorts, and Podcasts using TypeScript.

Data Normalization: Automatically convert subscriber/view strings (e.g., "1.2M") into standard integers.

🚀 Key Features
Comprehensive Scoping: Supports basic_info, video, shorts, and podcast categories.

Headless Performance: Optimized for fast, background execution via Playwright.

Developer Friendly: Built with modern ECMAScript standards (ES2020) and NodeNext module resolution.

🔧 Setup & Installation
Clone & Install:

Bash
git clone https://github.com/yshail/youtube-stream-scraper.git
cd youtube-stream-scraper
npm install
Install Browsers:

Bash
npx playwright install chromium
💻 Usage
Consume data in real-time as it is scraped:

TypeScript
import { extract } from "./yt-yield";

async function run() {
  const scraper = extract("https://www.youtube.com/@OpenAI", "video");

  for await (const video of scraper) {
    console.log(`Found: ${video.title} | Views: ${video.views}`);
  }
}
🏗️ Roadmap
[ ] Implement proxy rotation to bypass rate limits.

[ ] Add extraction for upload dates and video duration.

[ ] Support export to JSON, CSV, and MongoDB.

[ ] Create a CLI for quick-start scraping tasks.
