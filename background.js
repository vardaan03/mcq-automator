// background.js — v6.1 FIX: Always read keys from storage (survives service worker restarts)
//
// Developer: paste your backup keys below (comma-separated).
const BUILT_IN_KEYS = "PASTE_YOUR_KEY_HERE";

// ── Question-Answer Cache ──
let qaCache = {};

chrome.storage.local.get(["qaCache"], (r) => {
  if (r.qaCache) qaCache = r.qaCache;
});

function hashQuestion(text) {
  let hash = 0;
  const s = text.toLowerCase().replace(/\s+/g, " ").trim();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return "q_" + Math.abs(hash).toString(36);
}

function saveCache() {
  chrome.storage.local.set({ qaCache });
}

// Helper: always fetch keys fresh from storage (survives SW restarts)
async function getActiveKeys() {
  return new Promise(resolve => {
    chrome.storage.local.get(["userApiKeys"], (r) => {
      const userKeys = (r.userApiKeys || "").split(",").map(k => k.trim()).filter(Boolean);
      const builtIn = BUILT_IN_KEYS.split(",").map(k => k.trim()).filter(k => k && k !== "PASTE_YOUR_KEY_HERE");
      resolve([...userKeys, ...builtIn]);
    });
  });
}

// ── Message Handler ────────────────────────────────
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {

  if (req.action === "getKeyStatus") {
    getActiveKeys().then(keys => {
      sendResponse({
        hasKeys: keys.length > 0,
        keyCount: keys.length,
        cacheSize: Object.keys(qaCache).length,
        hasUserKey: keys.length > 0
      });
    });
    return true;
  }

  if (req.action === "setUserKeys") {
    chrome.storage.local.set({ userApiKeys: req.keys }, () => {
      getActiveKeys().then(keys => {
        sendResponse({ keyCount: keys.length });
      });
    });
    return true;
  }

  if (req.action === "checkCache") {
    // Reload cache from storage first (in case SW restarted)
    chrome.storage.local.get(["qaCache"], (r) => {
      if (r.qaCache) qaCache = r.qaCache;
      const results = {};
      for (const q of req.questions) {
        const h = hashQuestion(q);
        if (qaCache[h]) results[q] = qaCache[h].answer;
      }
      sendResponse({ cached: results, hits: Object.keys(results).length });
    });
    return true;
  }

  if (req.action === "storeCache") {
    for (const [question, answer] of Object.entries(req.entries)) {
      const h = hashQuestion(question);
      qaCache[h] = { answer, timestamp: Date.now() };
    }
    saveCache();
    sendResponse({ cacheSize: Object.keys(qaCache).length });
    return true;
  }

  if (req.action !== "evaluatePrompt") return false;

  // Always fetch keys fresh from storage
  getActiveKeys().then(async (allKeys) => {
    if (allKeys.length === 0) {
      sendResponse({ error: "NO_KEYS" });
      return;
    }

    let idx = 0;
    for (let attempt = 0; attempt < allKeys.length; attempt++) {
      const key = allKeys[(idx + attempt) % allKeys.length];
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: req.prompt }] }],
              generationConfig: { temperature: 0.0 },
            }),
          }
        );
        const data = await resp.json();

        if (data.error) {
          const msg = data.error.message || "";
          if (msg.includes("429") || msg.toLowerCase().includes("quota") ||
              msg.toLowerCase().includes("limit") || msg.toLowerCase().includes("exhausted")) {
            continue; // try next key
          }
          sendResponse({ error: msg });
          return;
        }

        if (data.candidates?.[0]?.content) {
          sendResponse({ answer: data.candidates[0].content.parts[0].text.trim() });
          return;
        }

        sendResponse({ error: "Empty response." });
        return;
      } catch (e) {
        continue; // try next key
      }
    }

    sendResponse({ error: "ALL_KEYS_EXHAUSTED" });
  });

  return true;
});
