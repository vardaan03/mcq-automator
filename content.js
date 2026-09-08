/*  content.js — v7 FULL COURSE AUTOMATOR
 *  ────────────────────────────────────────
 *  Features:
 *  1. User profile prompt (name, reg no.) on first run
 *  2. Auto-navigate sessions via sunburst chart arcs
 *  3. Progress detection — skip green (completed) arcs
 *  4. Worksheet PDF auto-submit (Google Drive links)
 *  5. MCQ solver with cache-first AI
 *  6. Full session orchestration
 */

let running = false;
let userProfile = null; // { name, regNo }
let stats = { totalQuestions: 0, totalSubmissions: 0, worksheetsSubmitted: 0, scores: [] };
let processedSessions = new Set(); // To prevent looping on the same session

// ── PDF LINK MAP ──────────────────────────────────
// Maps session code → { slo1: driveLink, slo2: driveLink }
// Supports Units 1 and 2 (sessions 101-109, 201-209).
const PDF_LINKS = {
  "101": {
    slo1: "https://drive.google.com/file/d/1B84gRQHrdD95v0zBti_by2u82tg4HCIa/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1OBbmVlqdeCasdz7I_RsQSUuO-rQyK7su/view?usp=sharing"
  },
  "102": {
    slo1: "https://drive.google.com/file/d/1IdLXm9zlYh8n52Fcc2hVXtk6ErHf0Hvf/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1RIZg6BkWOHsdezwvR5VU1gDg4k7Hhg98/view?usp=sharing"
  },
  "103": {
    slo1: "https://drive.google.com/file/d/1MeayREodlPMSPDKw2wOHIL2ljlx7tFqb/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1uaRHvw2VD6mAzggMx-GmGwsDKWQwz7Zr/view?usp=sharing"
  },
  "104": {
    slo1: "https://drive.google.com/file/d/143F-5zWIwKZ99KRR9yv3CWcIeoTQJICh/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1qGFCnfrtXR1ATUk7s7OMSGY6rjvH9YND/view?usp=sharing"
  },
  "105": {
    slo1: "https://drive.google.com/file/d/10gfD6hVJNv7FI47FviMixLGnVIbEHCAM/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1b6796UCUf8-GzYWNlIJsiEXHZW0xp0XC/view?usp=sharing"
  },
  "106": {
    slo1: "https://drive.google.com/file/d/1L32ZaYlEVtg0OoaM8fcOX2Tjz5IS9wYH/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1sZPowBK-YmlKNh8aTP7ktbxY08Ob354W/view?usp=sharing"
  },
  "107": {
    slo1: "https://drive.google.com/file/d/1-Try9Y4YkFDb_bilSwAEipN_oQqUEIlX/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1k3PBY4BWth2aond81Vyh7g1Q5mHboZTR/view?usp=sharing"
  },
  "108": {
    slo1: "https://drive.google.com/file/d/1EGK5zKiACOmg36PihImmiZAj2EJlR8Ev/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1SGejHHvzkZ9haNcHpEZxyoS2ATDFjwEE/view?usp=sharing"
  },
  "109": {
    slo1: "https://drive.google.com/file/d/1mwOVH9wINylzjfNVvWKELF819lSgNueg/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1z9cHiD7VviDDpc3WtNxDUj3fMgeHgX5F/view?usp=sharing"
  },
  "201": {
    slo1: "https://drive.google.com/file/d/11BRPdXs6J_M2BLuzE4aiWbrgL9QN_TUY/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1JyL1VOQ6__q1ec2FZ-RMAlDD1hHJrccn/view?usp=sharing"
  },
  "202": {
    slo1: "https://drive.google.com/file/d/1FaJL1mtGakZWcvelRRbBuDtAxRwbC4qL/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1pkZLqX76QqFNehlIyG9bO-SyUbWyQ62I/view?usp=sharing"
  },
  "203": {
    slo1: "https://drive.google.com/file/d/1Dn7LhC_1UHZvt4Hx08EXRf6qsJPZN7lv/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1_dI69SE9i32qUcxpYEpO4_B_6yqOHi4m/view?usp=sharing"
  },
  "204": {
    slo1: "https://drive.google.com/file/d/1PxlhZyoKLrSSwB2RZgbXQX4ud9jPmerM/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1vLpexBxQ4Ho4m1R5fMm99Ac9YkAZpyvv/view?usp=sharing"
  },
  "205": {
    slo1: "https://drive.google.com/file/d/1WtCCvZXgR_AoSS9MVdsKSPgXy1CXyOO3/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1FQwn1Y5_cU2tvmYfkP-4vmIJ99pOfpKJ/view?usp=sharing"
  },
  "206": {
    slo1: "https://drive.google.com/file/d/1Fdu2Sp4mjwnp-JenaCBAO8E3JvPNDd6p/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1CGau8sNtcEM-8s7nc5jD04o-vsXgbSUw/view?usp=sharing"
  },
  "207": {
    slo1: "https://drive.google.com/file/d/1a5F6TVNXRJK5VKToB9dxPKb5soAJSD6h/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1LoQ6M5_sn4EKfPLFp2GuwKCClfxRX2Ln/view?usp=sharing"
  },
  "208": {
    slo1: "https://drive.google.com/file/d/1u_chjpqD_4ks1DlMaCajAs0jSpJYBy5s/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1jNn3ew-CQaqS4hFwg-hR2DzoTH6DwvZy/view?usp=sharing"
  },
  "209": {
    slo1: "https://drive.google.com/file/d/1lC-ZRqImENl7YhPM8qACDAPMwCeLO9b1/view?usp=sharing",
    slo2: "https://drive.google.com/file/d/1ruU_10cUZkClw_nw8vPa_OJSE9KT6n83/view?usp=sharing"
  }
};

// ── UI ─────────────────────────────────────────────
const panel = document.createElement("div");
panel.id = "qa-agent-panel";
panel.style.cssText = `
  position:fixed; bottom:12px; right:12px; width:360px;
  background:#0f172a; color:#e2e8f0; border-radius:14px;
  box-shadow:0 12px 40px rgba(0,0,0,.8); z-index:2147483647;
  font-family:'Segoe UI',system-ui,sans-serif; padding:14px;
  display:flex; flex-direction:column; gap:10px;
  border:1px solid #1e293b; max-height:85vh; overflow-y:auto;
`;
panel.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between">
    <span style="font-weight:700;font-size:15px">🤖 Course Automator v7</span>
    <div style="display:flex;gap:6px;align-items:center">
      <span id="qa-cache-badge" style="font-size:10px;padding:2px 8px;border-radius:99px;font-weight:600;background:#334155;color:#94a3b8">Cache: 0</span>
      <span id="qa-settings-btn" style="cursor:pointer;font-size:16px;opacity:0.5;transition:0.2s" title="Settings">⚙️</span>
    </div>
  </div>

  <!-- Profile Section -->
  <div id="qa-profile" style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #334155">
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">👤 Student Profile</div>
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <input id="qa-name" type="text" placeholder="Full Name (e.g. Vardaan Sharma)"
        style="flex:1;padding:7px 10px;border-radius:6px;border:1px solid #475569;
        background:#0f172a;color:#f1f5f9;outline:none;font-size:12px">
    </div>
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <input id="qa-regno" type="text" placeholder="Reg No. (e.g. RA2511047010016)"
        style="flex:1;padding:7px 10px;border-radius:6px;border:1px solid #475569;
        background:#0f172a;color:#f1f5f9;outline:none;font-size:12px">
    </div>
    <button id="qa-save-profile" style="width:100%;padding:8px;background:#8b5cf6;color:#fff;border:none;
      border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;transition:0.2s">
      💾 Save Profile
    </button>
    <div id="qa-profile-status" style="font-size:10px;color:#64748b;margin-top:4px"></div>
  </div>

  <!-- BYOK Section -->
  <div id="qa-byok" style="background:#1e293b;padding:12px;border-radius:8px;border:1px solid #334155">
    <div style="font-size:13px;font-weight:600;margin-bottom:6px">🔑 API Key Setup</div>
    <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">Get your free API key for AI-powered MCQ answers:</div>
    <div style="display:flex;gap:6px;align-items:center">
      <button id="qa-get-key" style="flex:1;padding:8px;background:#3b82f6;color:#fff;border:none;
        border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;transition:0.2s">
        1. Get Free Key →
      </button>
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-top:6px">
      <input id="qa-key" type="password" placeholder="2. Paste key here…"
        style="flex:1;padding:8px;border-radius:6px;border:1px solid #475569;
        background:#0f172a;color:#f1f5f9;outline:none;font-size:12px">
      <button id="qa-save-key" style="padding:8px 12px;background:#22c55e;color:#fff;border:none;
        border-radius:6px;cursor:pointer;font-weight:600;font-size:12px">Save</button>
    </div>
    <div id="qa-key-status" style="font-size:10px;color:#64748b;margin-top:4px"></div>
  </div>

  <!-- Hidden settings -->
  <div id="qa-settings" style="display:none;background:#1e293b;padding:10px;border-radius:8px;border:1px solid #334155">
    <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Extra keys (comma-separated):</label>
    <input id="qa-extra-keys" type="password" placeholder="AIzaSy..., AIzaSy..."
      style="width:100%;box-sizing:border-box;padding:6px 8px;border-radius:4px;
      border:1px solid #475569;background:#0f172a;color:#f1f5f9;outline:none;font-size:11px">
  </div>

  <!-- Mode selector -->
  <div style="display:flex;gap:6px;">
    <button id="qa-mode-full" style="flex:1;padding:6px;background:#3b82f6;color:#fff;border:none;
      border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;transition:0.2s;
      border:2px solid #3b82f6">🚀 Full Auto</button>
    <button id="qa-mode-mcq" style="flex:1;padding:6px;background:#1e293b;color:#94a3b8;border:none;
      border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;transition:0.2s;
      border:2px solid #334155">🧠 MCQ Only</button>
    <button id="qa-mode-pdf" style="flex:1;padding:6px;background:#1e293b;color:#94a3b8;border:none;
      border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;transition:0.2s;
      border:2px solid #334155">📄 PDF Only</button>
  </div>

  <!-- Controls -->
  <div style="display:flex;align-items:center;justify-content:space-between;
    background:#1e293b;padding:10px 12px;border-radius:8px;font-size:14px">
    <span>Status: <b id="qa-status" style="color:#facc15">Idle</b></span>
    <button id="qa-go" style="padding:8px 24px;background:#22c55e;color:#fff;
      border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;
      transition:0.2s;box-shadow:0 2px 8px rgba(34,197,94,0.3)">▶ Start</button>
  </div>

  <!-- Stats -->
  <div style="display:flex;gap:4px;font-size:11px;">
    <span style="background:#1e293b;padding:5px 6px;border-radius:6px;flex:1;text-align:center">
      MCQs: <b id="st-qs" style="color:#38bdf8">0</b>
    </span>
    <span style="background:#1e293b;padding:5px 6px;border-radius:6px;flex:1;text-align:center">
      PDFs: <b id="st-pdf" style="color:#a78bfa">0</b>
    </span>
    <span style="background:#1e293b;padding:5px 6px;border-radius:6px;flex:1;text-align:center">
      Subs: <b id="st-sub" style="color:#f472b6">0</b>
    </span>
    <span style="background:#1e293b;padding:5px 6px;border-radius:6px;flex:1;text-align:center">
      Avg: <b id="st-avg" style="color:#34d399">—</b>
    </span>
  </div>

  <!-- Progress bar -->
  <div style="background:#1e293b;border-radius:6px;overflow:hidden;height:6px">
    <div id="qa-progress" style="width:0%;height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);
      transition:width 0.5s ease;border-radius:6px"></div>
  </div>

  <!-- Log -->
  <div id="qa-log" style="font-size:11px;color:#94a3b8;height:160px;overflow-y:auto;
    background:#020617;padding:8px;border-radius:6px;font-family:'Cascadia Mono',Consolas,monospace;
    border:1px solid #1e293b;line-height:1.5"></div>
`;
document.body.appendChild(panel);

// ── DOM refs ──
const $log          = document.getElementById("qa-log");
const $status       = document.getElementById("qa-status");
const $go           = document.getElementById("qa-go");
const $key          = document.getElementById("qa-key");
const $saveKey      = document.getElementById("qa-save-key");
const $getKey       = document.getElementById("qa-get-key");
const $keyStatus    = document.getElementById("qa-key-status");
const $byok         = document.getElementById("qa-byok");
const $cacheBadge   = document.getElementById("qa-cache-badge");
const $stQs         = document.getElementById("st-qs");
const $stPdf        = document.getElementById("st-pdf");
const $stSub        = document.getElementById("st-sub");
const $stAvg        = document.getElementById("st-avg");
const $settings     = document.getElementById("qa-settings");
const $settingsBtn  = document.getElementById("qa-settings-btn");
const $extraKeys    = document.getElementById("qa-extra-keys");
const $profile      = document.getElementById("qa-profile");
const $name         = document.getElementById("qa-name");
const $regNo        = document.getElementById("qa-regno");
const $saveProfile  = document.getElementById("qa-save-profile");
const $profileStatus= document.getElementById("qa-profile-status");
const $progress     = document.getElementById("qa-progress");
const $modeFull     = document.getElementById("qa-mode-full");
const $modeMcq      = document.getElementById("qa-mode-mcq");
const $modePdf      = document.getElementById("qa-mode-pdf");

let currentMode = "full"; // "full", "mcq", "pdf"

// ── Mode buttons ──
function setMode(mode) {
  currentMode = mode;
  [$modeFull, $modeMcq, $modePdf].forEach(b => {
    b.style.background = "#1e293b"; b.style.color = "#94a3b8"; b.style.borderColor = "#334155";
  });
  const active = mode === "full" ? $modeFull : mode === "mcq" ? $modeMcq : $modePdf;
  active.style.background = "#3b82f6"; active.style.color = "#fff"; active.style.borderColor = "#3b82f6";
  log(`🔧 Mode: ${mode === "full" ? "Full Auto" : mode === "mcq" ? "MCQ Only" : "PDF Only"}`);
}
$modeFull.addEventListener("click", () => setMode("full"));
$modeMcq.addEventListener("click", () => setMode("mcq"));
$modePdf.addEventListener("click", () => setMode("pdf"));

// ── Settings toggle ──
$settingsBtn.addEventListener("click", () => {
  $settings.style.display = $settings.style.display === "none" ? "block" : "none";
  $settingsBtn.style.opacity = $settings.style.display === "none" ? "0.5" : "1";
});

// ── Helpers ──
function log(msg) {
  console.log("[Automator]", msg);
  $log.insertAdjacentHTML("beforeend", `<div>> ${msg}</div>`);
  $log.scrollTop = $log.scrollHeight;
}
function updateStatsUI() {
  $stQs.textContent  = stats.totalQuestions;
  $stPdf.textContent  = stats.worksheetsSubmitted;
  $stSub.textContent = stats.totalSubmissions;
  if (stats.scores.length > 0) {
    const avg = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    $stAvg.textContent = avg.toFixed(1) + "%";
  }
}
function saveStats() {
  chrome.storage.local.set({ mcqStats: stats });
  updateStatsUI();
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// React-compatible input setter
function setInputValue(input, value) {
  const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeSet.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

// ── PROFILE MANAGEMENT ──
chrome.storage.local.get(["userProfile", "mcqStats"], (r) => {
  if (r.mcqStats) { stats = r.mcqStats; updateStatsUI(); }
  if (r.userProfile) {
    userProfile = r.userProfile;
    $name.value = userProfile.name || "";
    $regNo.value = userProfile.regNo || "";
    $profile.style.display = "none";
    log(`👤 Welcome back, ${userProfile.name}!`);
  } else {
    log("👤 Please enter your profile details above.");
  }
});

$saveProfile.addEventListener("click", () => {
  const name = $name.value.trim();
  const regNo = $regNo.value.trim();
  if (!name || !regNo) {
    $profileStatus.textContent = "Please fill both fields.";
    $profileStatus.style.color = "#f87171";
    return;
  }
  userProfile = { name, regNo };
  chrome.storage.local.set({ userProfile }, () => {
    $profileStatus.textContent = `✅ Saved: ${name} (${regNo})`;
    $profileStatus.style.color = "#22c55e";
    log(`👤 Profile saved: ${name} — ${regNo}`);
    setTimeout(() => { $profile.style.display = "none"; }, 1500);
  });
});

// ── KEY STATUS ──
chrome.runtime.sendMessage({ action: "getKeyStatus" }, (resp) => {
  if (resp) {
    $cacheBadge.textContent = `Cache: ${resp.cacheSize}`;
    if (resp.hasUserKey) {
      $byok.style.display = "none";
      log("✅ API key loaded. Ready!");
    } else {
      log("🔑 Add your free API key for MCQ solving.");
    }
  }
});

// ── BYOK Handlers ──
$getKey.addEventListener("click", () => {
  window.open("https://aistudio.google.com/apikey", "_blank");
  $keyStatus.textContent = "Opened Google AI Studio — create a key and paste below!";
  $keyStatus.style.color = "#38bdf8";
});

$saveKey.addEventListener("click", () => {
  const key = $key.value.trim();
  if (!key) { $keyStatus.textContent = "Paste a key first."; $keyStatus.style.color = "#f87171"; return; }
  chrome.runtime.sendMessage({ action: "setUserKeys", keys: key }, (resp) => {
    $keyStatus.textContent = `✅ Key saved! (${resp.keyCount} total)`;
    $keyStatus.style.color = "#22c55e";
    log(`🔑 Key saved. ${resp.keyCount} key(s) active.`);
    setTimeout(() => { $byok.style.display = "none"; }, 1500);
  });
});

$extraKeys.addEventListener("change", () => {
  const keys = $extraKeys.value.trim();
  if (keys) {
    chrome.runtime.sendMessage({ action: "setUserKeys", keys }, (resp) => {
      log(`Extra keys set. ${resp.keyCount} total.`);
    });
  }
});

// ── Start/Stop ──
$go.addEventListener("click", () => {
  running = !running;
  if (running) {
    // Validate profile
    if (!userProfile) {
      log("❌ Please set up your profile first (name + reg no.)!");
      $profile.style.display = "block";
      running = false;
      return;
    }
    $go.innerHTML = "⏹ Stop"; $go.style.background = "#ef4444";
    $go.style.boxShadow = "0 2px 8px rgba(239,68,68,0.3)";
    $status.textContent = "Running"; $status.style.color = "#22c55e";
    log("▶ Agent started — mode: " + currentMode);
    tick();
  } else {
    $go.innerHTML = "▶ Start"; $go.style.background = "#22c55e";
    $go.style.boxShadow = "0 2px 8px rgba(34,197,94,0.3)";
    $status.textContent = "Idle"; $status.style.color = "#facc15";
    log("⏸ Paused");
  }
});

// ── CACHE-FIRST API CALL ──
async function solveQuestions(questionsArr) {
  const questionTexts = questionsArr.map(q => q.questionText);

  // Step 1: Check cache
  const cacheResp = await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: "checkCache", questions: questionTexts }, resolve);
  });

  const cached = cacheResp?.cached || {};
  const uncached = questionsArr.filter(q => !cached[q.questionText]);

  if (Object.keys(cached).length > 0) {
    log(`⚡ ${Object.keys(cached).length} cached, ${uncached.length} need AI`);
  }

  // Step 2: API for uncached
  let apiAnswers = {};
  if (uncached.length > 0) {
    const prompt = `You are an expert test-solver. Answer ALL the following questions.
For EACH question, output ONLY the exact text of the correct option on its own line.
Format:
1. [exact option text]
2. [exact option text]

${uncached.map((q, i) => {
  return `${i+1}. ${q.questionText}\n   Options: ${q.options.map((o,j) => `${String.fromCharCode(65+j)}) ${o.text}`).join(" | ")}`;
}).join("\n\n")}`;

    const resp = await new Promise(resolve => {
      chrome.runtime.sendMessage({ action: "evaluatePrompt", prompt }, resolve);
    });

    if (resp && resp.answer) {
      const lines = resp.answer.split("\n").map(l => l.replace(/^\d+[\.)\]]\s*/, "").trim()).filter(Boolean);
      uncached.forEach((q, i) => {
        if (lines[i]) apiAnswers[q.questionText] = lines[i];
      });

      // Store in cache
      chrome.runtime.sendMessage({ action: "storeCache", entries: apiAnswers }, (r) => {
        if (r) $cacheBadge.textContent = `Cache: ${r.cacheSize}`;
      });
    } else if (resp?.error === "NO_KEYS" || resp?.error === "ALL_KEYS_EXHAUSTED") {
      log("❌ No API keys available.");
      log("🔑 Click 'Get Free Key' above!");
      $byok.style.display = "block";
      return null;
    } else {
      log("❌ API error: " + (resp?.error || "unknown"));
      return null;
    }
  }

  const allAnswers = { ...cached, ...apiAnswers };
  return questionsArr.map(q => allAnswers[q.questionText] || "");
}

// ── DOM HELPERS ──────────────────────────────────────

function parseQuestions() {
  const groups = document.querySelectorAll(".ant-radio-group");
  const questions = [];
  groups.forEach((group) => {
    let questionText = "";
    let node = group;
    for (let i = 0; i < 8 && node; i++) {
      const prev = node.previousElementSibling;
      if (prev) { const t = prev.innerText.trim(); if (t.length > 5) { questionText = t; break; } }
      node = node.parentElement;
    }
    if (!questionText) {
      const li = group.closest(".ant-list-item");
      if (li) { for (const line of li.innerText.split("\n").map(l=>l.trim()).filter(Boolean)) {
        if (/^\d+\.\s/.test(line) && line.length > 10) { questionText = line; break; }
      }}
    }
    const radios = group.querySelectorAll("input.ant-radio-input");
    const options = [];
    radios.forEach((radio) => {
      let text = "";
      const row = radio.closest(".ant-space.ant-space-horizontal") || radio.closest(".ant-space-item")?.parentElement;
      if (row) { const p = row.querySelector("p"); if (p) text = p.innerText.trim(); if (!text) text = row.innerText.trim(); }
      if (!text) { const label = radio.closest("label"); if (label) text = label.innerText.trim(); }
      if (text) options.push({ text, radioInput: radio });
    });
    if (questionText && options.length >= 2) questions.push({ questionText, options });
  });
  return questions;
}

function isAnswered(q) { return q.options.some(o => o.radioInput.checked); }
function clickRadio(r) { const l = r.closest("label.ant-radio-wrapper"); if (l) l.click(); else r.click(); }

function clickSubmit() {
  for (const btn of document.querySelectorAll("button.ant-btn-primary")) {
    const t = btn.innerText.trim().toUpperCase();
    if (t.includes("SUBMISSION") || t.includes("SUBMIT")) { btn.click(); return true; }
  }
  return false;
}

function expandPanel(panelName) {
  for (const h of document.querySelectorAll(".ant-collapse-header")) {
    if (h.innerText.includes(panelName)) {
      if (!h.parentElement.classList.contains("ant-collapse-item-active")) {
        h.click();
        return true;
      }
      return false; // already expanded
    }
  }
  return false; // not found
}

function isPanelExpanded(panelName) {
  for (const h of document.querySelectorAll(".ant-collapse-header"))
    if (h.innerText.includes(panelName))
      return h.parentElement.classList.contains("ant-collapse-item-active");
  return false;
}

function isPanelPresent(panelName) {
  for (const h of document.querySelectorAll(".ant-collapse-header"))
    if (h.innerText.includes(panelName)) return true;
  return false;
}

function getLastScore() {
  for (const el of document.querySelectorAll("*")) {
    const m = (el.innerText||"").trim().match(/Last Score\s*:\s*([\d.]+)%/);
    if (m && el.children.length < 3) return parseFloat(m[1]);
  }
  return null;
}

function getCurrentSession() {
  for (const t of document.querySelectorAll(".ant-card-head-title")) {
    const m = t.innerText.match(/Learning Unit\s*:\s*(\d+)\s*&\s*Session\s*:\s*(\d+)/);
    if (m) return { unit: parseInt(m[1]), session: parseInt(m[2]) };
  }
  return null;
}

// Get arc colors for progress detection
function getArcStatus() {
  const arcs = [];
  document.querySelectorAll('svg path[id*="mainArc"]').forEach(p => {
    const id = p.id;
    const fill = p.style.fill;
    const isGreen = fill === "rgb(38, 222, 129)" || fill.includes("38, 222, 129");
    const isYellow = fill === "rgb(247, 183, 49)" || fill.includes("247, 183, 49");
    const isRed = fill === "rgb(252, 92, 101)" || fill.includes("252, 92, 101");
    arcs.push({
      id, fill,
      status: isGreen ? "completed" : isYellow ? "in_progress" : isRed ? "not_started" : "unknown",
      element: p
    });
  });
  return arcs;
}

// Get incomplete sessions (need work)
function getIncompleteSessionArcs() {
  const arcs = getArcStatus();
  const sessions = {}; // group by session: "101", "102", etc.

  for (const arc of arcs) {
    // Extract session key: mainArc-1011 → "101", mainArc-1012 → "101"
    const match = arc.id.match(/mainArc-(\d{3})\d/);
    if (!match) continue;
    const sessionKey = match[1];

    if (!sessions[sessionKey]) sessions[sessionKey] = { arcs: [], allCompleted: true };
    sessions[sessionKey].arcs.push(arc);
    if (arc.status !== "completed") sessions[sessionKey].allCompleted = false;
  }

  // Return first incomplete session's first arc
  const result = [];
  for (const [key, session] of Object.entries(sessions)) {
    if (!session.allCompleted && !processedSessions.has(key)) {
      result.push({ sessionKey: key, arc: session.arcs[0], arcs: session.arcs });
    }
  }
  return result;
}

// ── WORKSHEET PDF SUBMISSION ──────────────────────────

async function submitWorksheetPDFs(sessionKey) {
  const links = PDF_LINKS[sessionKey];
  if (!links) {
    // No PDFs for this session — skip silently
    return false;
  }

  let submitted = 0;

  // Expand SLO 1 Learning Practice
  const expandedLP = expandPanel("Learning Practice");
  if (expandedLP) await wait(1500);

  // Try SLO 1
  const input1 = document.getElementById("studentPractice1Link");
  if (input1) {
    const currentVal = input1.value.trim();
    if (currentVal && currentVal.includes("drive.google.com")) {
      log(`📄 SLO1 already has a link — skipping`);
    } else {
      setInputValue(input1, links.slo1);
      await wait(500);

      // Find and click the UPDATE button near this input
      const td = input1.closest("td") || input1.parentElement;
      if (td) {
        const updateBtn = td.querySelector("button.ant-btn-dangerous") ||
          Array.from(td.querySelectorAll("button")).find(b => b.innerText.includes("UPDATE"));
        if (updateBtn) {
          updateBtn.click();
          log(`✅ SLO1 PDF submitted`);
          submitted++;
          await wait(2000);
        } else {
          log("⚠️ SLO1: UPDATE button not found");
        }
      }
    }
  }

  // Scroll down to find SLO 2
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  await wait(1500);

  // Expand SLO 2 Learning Practice if needed
  const allHeaders = document.querySelectorAll(".ant-collapse-header");
  let lpCount = 0;
  for (const h of allHeaders) {
    if (h.innerText.includes("Learning Practice")) {
      lpCount++;
      if (lpCount === 2 && !h.parentElement.classList.contains("ant-collapse-item-active")) {
        h.click();
        await wait(1500);
      }
    }
  }

  // Try SLO 2
  const input2 = document.getElementById("studentPractice2Link");
  if (input2) {
    const currentVal = input2.value.trim();
    if (currentVal && currentVal.includes("drive.google.com")) {
      log(`📄 SLO2 already has a link — skipping`);
    } else {
      setInputValue(input2, links.slo2);
      await wait(500);

      const td = input2.closest("td") || input2.parentElement;
      if (td) {
        const updateBtn = td.querySelector("button.ant-btn-dangerous") ||
          Array.from(td.querySelectorAll("button")).find(b => b.innerText.includes("UPDATE"));
        if (updateBtn) {
          updateBtn.click();
          log(`✅ SLO2 PDF submitted`);
          submitted++;
          await wait(2000);
        } else {
          log("⚠️ SLO2: UPDATE button not found");
        }
      }
    }
  }

  if (submitted > 0) {
    stats.worksheetsSubmitted += submitted;
    saveStats();
  }

  return submitted > 0;
}

// ── MCQ SOLVING ──────────────────────────────────

async function solveMCQsOnPage() {
  // Expand MCQ panel if present
  if (isPanelPresent("Multiple Choice Questions") && !isPanelExpanded("Multiple Choice Questions")) {
    log("📂 Expanding MCQ…");
    expandPanel("Multiple Choice Questions");
    await wait(2000);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    await wait(1500);
  }

  const questions = parseQuestions();
  const unanswered = questions.filter(q => !isAnswered(q));

  if (unanswered.length > 0) {
    log(`📝 ${unanswered.length} MCQs found`);

    const answers = await solveQuestions(unanswered);
    if (!answers) return false;

    for (let i = 0; i < unanswered.length; i++) {
      const q = unanswered[i];
      const ans = (answers[i] || "").replace(/^\d+[\.)\]]\s*/, "").trim();
      let match = q.options.find(o => o.text === ans) ||
                  q.options.find(o => o.text.toLowerCase() === ans.toLowerCase()) ||
                  q.options.find(o => o.text.toLowerCase().includes(ans.toLowerCase())) ||
                  q.options.find(o => ans.toLowerCase().includes(o.text.toLowerCase()));
      if (match) {
        log(`✅ Q${i+1}: "${match.text.substring(0,35)}…"`);
        clickRadio(match.radioInput);
        stats.totalQuestions++;
        await wait(500 + Math.random() * 500);
      } else {
        log(`⚠️ Q${i+1}: No match for "${ans.substring(0,25)}…"`);
      }
    }
    saveStats();

    // Submit
    await wait(1000);
    if (clickSubmit()) {
      stats.totalSubmissions++;
      log("📨 MCQs Submitted!");
      await wait(4000);
      const score = getLastScore();
      if (score !== null) { stats.scores.push(score); log(`📊 Score: ${score}%`); }
      saveStats();
    }
    return true;
  } else if (questions.length > 0) {
    log("✔ MCQs already answered");
    return true;
  }
  return false;
}

// ── FULL SESSION HANDLER ──────────────────────────

async function processSession(sessionKey, arc) {
  const cur = getCurrentSession();
  log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━`);
  log(`📍 Processing: Session ${sessionKey} (Unit ${cur?.unit||"?"} S${cur?.session||"?"})`);

  // Step 1: PDF Worksheets
  if ((currentMode === "full" || currentMode === "pdf") && PDF_LINKS[sessionKey]) {
    log("📄 Submitting worksheets…");
    await submitWorksheetPDFs(sessionKey);
  } else if (currentMode !== "mcq" && !PDF_LINKS[sessionKey]) {
    log("📄 No PDFs for this session — skipping worksheets");
  }

  // Step 2: MCQs
  if (currentMode === "full" || currentMode === "mcq") {
    log("🧠 Checking MCQs…");
    // Scroll to MCQ section
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    await wait(1500);
    await solveMCQsOnPage();
  }

  processedSessions.add(sessionKey);
  log(`✅ Session ${sessionKey} done (marked as processed)`);
}

// ── MAIN LOOP ────────────────────────────────────────

async function tick() {
  if (!running) return;
  try {
    // Check if we're on the course content page (has sunburst chart)
    const arcs = getArcStatus();
    const hasChart = arcs.length > 0;

    if (hasChart) {
      // Get all incomplete sessions
      const incomplete = getIncompleteSessionArcs();
      const total = Object.keys(PDF_LINKS).length;
      const completed = total - incomplete.length;
      $progress.style.width = `${(completed / total * 100).toFixed(0)}%`;

      if (incomplete.length === 0) {
        log("🎉 ALL SESSIONS COMPLETE!");
        $go.click();
        return;
      }

      const next = incomplete[0];
      log(`🔄 ${incomplete.length} sessions remaining → ${next.sessionKey}`);

      // Click the arc to navigate to session
      next.arc.element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      await wait(3000);
      window.scrollTo({ top: 300, behavior: "smooth" });
      await wait(1500);

      // Process the session
      await processSession(next.sessionKey, next.arc);

      // After processing, scroll back up to chart for next session
      await wait(2000);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await wait(1500);

    } else {
      // Not on chart page — try to handle current page
      // Maybe we're already on a session detail page

      // Try MCQs
      if (currentMode !== "pdf") {
        if (isPanelPresent("Multiple Choice Questions")) {
          await solveMCQsOnPage();
        }
      }

      // Try worksheets
      if (currentMode !== "mcq") {
        const cur = getCurrentSession();
        if (cur) {
          const key = `1${cur.session.toString().padStart(2, "0")}`;
          await submitWorksheetPDFs(key);
        }
      }
    }
  } catch (err) {
    log("❌ " + err.message);
  }

  setTimeout(() => { if (running) tick(); }, 3000);
}
