# 🧠 MCQ Automator

> A Chrome extension that automates course completion on SRM's e-learning platform — solves MCQs using Gemini AI, auto-submits worksheet PDFs, and navigates through sessions autonomously.

## ✨ Features

### 🚀 Full Course Automation
- **Sunburst Chart Navigation** — Detects incomplete sessions (red/yellow arcs) and auto-navigates to them
- **Progress Tracking** — Visual progress bar and real-time statistics (MCQs solved, PDFs submitted, average score)
- **Session Orchestration** — Processes sessions sequentially until the entire course is complete

### 🧠 AI-Powered MCQ Solving
- **Gemini AI Integration** — Uses Google Gemini Flash for accurate answer selection
- **Cache-First Architecture** — Caches solved questions to avoid redundant API calls
- **Multi-Key Support** — Rotate between multiple API keys to handle rate limits
- **Smart Matching** — Multiple fuzzy-matching strategies to map AI answers to DOM options

### 📄 Worksheet PDF Submission
- **Pre-mapped PDF Links** — Google Drive links for Units 1 & 2 (Sessions 101–209)
- **Auto-Fill & Submit** — Injects links into form fields and clicks the update button
- **Duplicate Detection** — Skips submission if a link is already present

### 🎛️ Flexible Operation Modes
| Mode | Description |
|------|-------------|
| 🚀 **Full Auto** | MCQs + PDFs + Navigation |
| 🧠 **MCQ Only** | Solve MCQs on the current page |
| 📄 **PDF Only** | Submit worksheets only |

### 👤 User Profile
- Saves student name and registration number
- Profile persists across sessions via Chrome storage

## 🖼️ UI

Floating overlay panel with:
- Student profile setup
- BYOK (Bring Your Own Key) section
- Mode selector buttons
- Live status, stats dashboard, and scrollable log console
- Progress bar tracking course completion

## 🛠️ Tech Stack

- **Chrome Extension** — Manifest V3
- **AI** — Google Gemini Flash API
- **Core** — Vanilla JavaScript
- **Storage** — `chrome.storage.local` for caching, profiles, and API keys
- **Target** — SRM KTR e-Curricula platform (`dld.srmist.edu.in`)

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/vardaan03/mcq-automator.git
   ```
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder

## 🔑 API Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/apikey) and create a free API key
2. Open the extension panel on the SRM portal
3. Paste your key in the "API Key Setup" section and click **Save**

> 💡 You can add multiple keys (comma-separated) in Settings for automatic rotation when rate-limited.

## 📁 Project Structure

```
├── manifest.json      # Extension manifest (MV3)
├── background.js      # Service worker — API calls, key rotation, Q&A cache
├── content.js         # Content script — DOM automation, MCQ solving, PDF submission
└── README.md
```

## ⚠️ Disclaimer

This tool is built for **educational and personal productivity purposes**. The developer is not responsible for any misuse. Use at your own risk and in accordance with your institution's academic integrity policies.

## 📄 License

MIT
