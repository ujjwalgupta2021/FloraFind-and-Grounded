/**
 * FloraFind & Grounded - Application Logic
 * Hacktoberfest 2026 Week 1 DEV Challenge
 * 
 * Features:
 * - Outdoor Quest Engine with category filtering & XP tracking
 * - Google AI Studio Gemma / Gemini Open Model Integration (Text & Multimodal)
 * - Automated Model Discovery & Fast Secured Model Direct Fetch
 * - Percentage Progress Bar UI Overlay with Stage Updates
 * - Secure Client-Side API Key Storage (No hardcoded keys)
 * - Intelligent Offline Fallback Engine with hilarious developer botanical specs
 * - Light & Dark Mode theme engine
 * - Outdoor Uptime Dashboard & Badge Achievement Engine persisted via LocalStorage
 */

const STATE_STORAGE_KEY = 'florafind_grounded_state_v1';

// Comprehensive Candidate Models List
const MODEL_CANDIDATE_LIST = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-2.0-flash-lite',
    'gemma-2-27b-it',
    'gemma-2-9b-it'
];

let appState = {
    apiKey: '',
    selectedModel: 'gemini-2.0-flash',
    theme: 'dark',
    totalMinutes: 0,
    questsCount: 0,
    scansCount: 0,
    streakDays: 1,
    xp: 0,
    activeQuest: null,
    questsFilter: 'all',
    currentTab: 'text',
    selectedImageBase64: '',
    selectedImageMime: 'image/jpeg',
    lastAnalysis: null,
    unlockedBadges: [],
    history: []
};

// Safe DOM Helpers
function setTextContent(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
    }
}

// Safe Fetch Helper with strict timeout handling via AbortController
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timer);
        return response;
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
        }
        throw err;
    }
}

function updateProgress(percentage, text, stepText) {
    const bar = document.getElementById('gemma-progress-bar');
    const percentText = document.getElementById('progress-percentage-text');
    const stageText = document.getElementById('progress-stage-text');
    const stepCounter = document.getElementById('progress-step-counter');
    
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    if (percentText) percentText.textContent = `${Math.round(percentage)}%`;
    if (stageText && text) stageText.textContent = text;
    if (stepCounter && stepText) stepCounter.textContent = stepText;
}

// Quest Catalog (Screen-Time Detox Tasks)
const QUEST_CATALOG = [
    {
        id: 'q1',
        title: 'Inspect Sidewalk Chlorophyll',
        category: 'quick',
        desc: 'Walk outdoors for 5 minutes. Locate a weed or blade of grass pushing through asphalt or concrete cracks.',
        difficulty: 'Easy',
        timeMins: 5,
        xp: 15,
        icon: 'footprints'
    },
    {
        id: 'q2',
        title: 'Locate 3-Leaf Hardware Redundancy',
        category: 'flora',
        desc: 'Walk to a nearby lawn or park. Find a clover specimen with at least 3 distinct leaf structures.',
        difficulty: 'Medium',
        timeMins: 10,
        xp: 25,
        icon: 'clover'
    },
    {
        id: 'q3',
        title: 'Deep Canopy Sunlight Audit',
        category: 'deep',
        desc: 'Spend 20 minutes under a large tree canopy. Observe how leaf arrangements maximize sunlight capture.',
        difficulty: 'Hard',
        timeMins: 20,
        xp: 50,
        icon: 'trees'
    },
    {
        id: 'q4',
        title: 'Find Autumn Garbage Collection',
        category: 'flora',
        desc: 'Find a tree currently dropping colorful leaves (chlorophyll degradation in progress). Collect one fallen leaf.',
        difficulty: 'Easy',
        timeMins: 10,
        xp: 20,
        icon: 'leaf'
    },
    {
        id: 'q5',
        title: 'Mindful Outdoor Hydration Run',
        category: 'quick',
        desc: 'Take a glass of water outside. Drink it while standing barefoot or sitting on grass without checking your phone.',
        difficulty: 'Easy',
        timeMins: 5,
        xp: 15,
        icon: 'droplets'
    },
    {
        id: 'q6',
        title: 'Botanical Texture Scavenger',
        category: 'flora',
        desc: 'Find two contrasting plant textures: one velvety/smooth leaf and one rough tree bark.',
        difficulty: 'Medium',
        timeMins: 12,
        xp: 30,
        icon: 'hand'
    },
    {
        id: 'q7',
        title: '1,000 Step Forest Debug',
        category: 'deep',
        desc: 'Take a continuous 15-minute walk through a natural trail, park, or green corridor.',
        difficulty: 'Hard',
        timeMins: 25,
        xp: 60,
        icon: 'compass'
    },
    {
        id: 'q8',
        title: 'Micro-Ecosystem Observation',
        category: 'quick',
        desc: 'Examine a small patch of moss or soil for 3 minutes. Spot any tiny insects performing outdoor background tasks.',
        difficulty: 'Easy',
        timeMins: 8,
        xp: 20,
        icon: 'bug'
    }
];

// Badge Achievements Catalog
const BADGES_CATALOG = [
    { id: 'b1', name: 'Seedling Debugger', icon: 'sprout', desc: 'Completed your first outdoor quest', reqType: 'quests', reqVal: 1 },
    { id: 'b2', name: 'Grass Protocol', icon: 'footprints', desc: 'Logged 30+ minutes of outdoor uptime', reqType: 'minutes', reqVal: 30 },
    { id: 'b3', name: 'Gemma Botanist', icon: 'cpu', desc: 'Analyzed 3 plants with Gemma AI', reqType: 'scans', reqVal: 3 },
    { id: 'b4', name: 'Solar Streak', icon: 'flame', desc: 'Maintained a 3-day outdoor streak', reqType: 'streak', reqVal: 3 },
    { id: 'b5', name: 'High Availability Fern', icon: 'trees', desc: 'Achieved 60+ minutes outdoor uptime', reqType: 'minutes', reqVal: 60 },
    { id: 'b6', name: 'Quantum Photosynthesis', icon: 'zap', desc: 'Earned 200+ Grass XP points', reqType: 'xp', reqVal: 200 }
];

// Offline Gemma AI Mock Database for Fallback Mode
const MOCK_GEMMA_RESPONSES = [
    {
        plantName: 'Trifolium Repens (White Clover)',
        devClass: 'java.util.CloverFactory',
        hardwareSpecs: '3-Leaf hardware redundancy array. Deployed with 99.999% fault tolerance against foot traffic.',
        photosynthesisUptime: '99.99% Peak Solar Yield',
        patchNotes: 'Fix: Hydrate root nodes daily. Patch 2.4 resolved yellowing leaf bug by increasing nitrogen allocation.',
        rarity: 'Common Specimen',
        xpPoints: 25
    },
    {
        plantName: 'Taraxacum Officinale (Dandelion)',
        devClass: 'com.nature.DandelionService',
        hardwareSpecs: 'Bright yellow solar panels that compile into lightweight wind-dispersal micro-drones.',
        photosynthesisUptime: '100% High Availability',
        patchNotes: 'Note: Unhandled exception when stepped on; auto-recovers root socket in 48 hours.',
        rarity: 'Uncommon Specimen',
        xpPoints: 30
    },
    {
        plantName: 'Pinus Sylvestris (Scots Pine)',
        devClass: 'org.forest.PineTreeSingleton',
        hardwareSpecs: 'Needle-shaped evergreen leaves with hydrophobic wax coating and resinous security patch.',
        photosynthesisUptime: '365-Day Continuous Production',
        patchNotes: 'Architecture advice: High thermal resilience in cold weather. Emits natural phytoncides to calm developer stress.',
        rarity: 'Rare Specimen',
        xpPoints: 45
    },
    {
        plantName: 'Bryophyta (Polytrichum Moss)',
        devClass: 'system.kernel.MossBuffer',
        hardwareSpecs: 'Ultra-dense micro-leaf array functioning as a natural dampening layer for soil architecture.',
        photosynthesisUptime: '98.5% Ambient Light Capture',
        patchNotes: 'Optimization tip: Absorbs up to 20x its dry weight in water. Zero memory leaks detected.',
        rarity: 'Epic Specimen',
        xpPoints: 50
    },
    {
        plantName: 'Helianthus Annuus (Sunflower)',
        devClass: 'net.solar.HeliotropismDaemon',
        hardwareSpecs: 'Dynamic motor cell tracker that auto-rotates facing angle towards primary light source.',
        photosynthesisUptime: '100% Dynamic Phototropic Efficiency',
        patchNotes: 'Feature: High seed payload density. Ideal hardware for generating natural energy snacks.',
        rarity: 'Legendary Specimen',
        xpPoints: 75
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    applyTheme();
    initLucideIcons();
    setupActiveQuest();
    renderQuests();
    renderBadges();
    renderDashboard();
    renderHistoryTable();
    updateApiStatusBadge();
});

// Helper: Refresh Lucide Icons
function initLucideIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Theme Switcher (Dark / Light Mode)
function toggleTheme() {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    saveStateToStorage();
    applyTheme();
    showToast(`Switched to ${appState.theme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

function applyTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-toggle-icon');

    if (appState.theme === 'light') {
        html.classList.remove('dark');
        html.classList.add('light');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
    }
    initLucideIcons();
}

// Storage Management
function loadStateFromStorage() {
    try {
        const stored = localStorage.getItem(STATE_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            appState = { ...appState, ...parsed };
        }
    } catch (e) {
        console.error('Failed to load state from localStorage', e);
    }
    
    // Set form controls
    const keyInput = document.getElementById('api-key-input');
    if (keyInput) keyInput.value = appState.apiKey || '';
}

function saveStateToStorage() {
    try {
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
        console.error('Failed to save state to localStorage', e);
    }
}

// API Modal Functions
function openApiModal() {
    const modal = document.getElementById('api-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeApiModal() {
    const modal = document.getElementById('api-modal');
    if (modal) modal.classList.add('hidden');
}

function toggleKeyVisibility() {
    const input = document.getElementById('api-key-input');
    const eyeIcon = document.getElementById('eye-icon');
    if (input && eyeIcon) {
        if (input.type === 'password') {
            input.type = 'text';
            eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            eyeIcon.setAttribute('data-lucide', 'eye');
        }
        initLucideIcons();
    }
}

// Automated Connection Tester & Model Securer
async function testAndSecureApiKeyConnection(key) {
    const discovered = await fetchAvailableModels(key);
    const modelsToTry = [...new Set([...discovered, ...MODEL_CANDIDATE_LIST])];
    const apiVersions = ['v1beta', 'v1'];

    let firstError = 'Invalid Key or Permission Denied';

    for (const apiVer of apiVersions) {
        for (const model of modelsToTry) {
            try {
                const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${key}`;
                const testPayload = {
                    contents: [{ parts: [{ text: 'Respond strictly with {"status":"ok"}' }] }]
                };
                
                const res = await fetchWithTimeout(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testPayload)
                }, 4000);

                if (res.ok) {
                    const data = await res.json();
                    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                        return { success: true, model: model, apiVer: apiVer };
                    }
                } else {
                    const errJson = await res.json().catch(() => ({}));
                    if (errJson?.error?.message) {
                        firstError = errJson.error.message;
                    }
                }
            } catch (err) {
                if (err.message) firstError = err.message;
            }
        }
    }

    return { success: false, error: firstError };
}

async function saveApiKey() {
    const keyInput = document.getElementById('api-key-input');
    const saveBtn = document.getElementById('btn-save-key');
    
    const val = keyInput ? keyInput.value.trim() : '';
    
    if (!val) {
        clearSavedKey();
        closeApiModal();
        return;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="inline-block w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span> Testing Connection...`;
    }

    try {
        const result = await testAndSecureApiKeyConnection(val);
        if (result.success) {
            appState.apiKey = val;
            appState.selectedModel = result.model;
            saveStateToStorage();
            updateApiStatusBadge();
            closeApiModal();
            showToast(`🎉 API key connection successful! Active model: ${result.model}`, 'success');
        } else {
            showToast(`API Key connection failed: ${result.error}`, 'error');
        }
    } catch (err) {
        showToast(`API Key connection failed: ${err.message}`, 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i data-lucide="save" class="w-4 h-4"></i> Save Key & Test Connection`;
            initLucideIcons();
        }
    }
}

function clearSavedKey() {
    const keyInput = document.getElementById('api-key-input');
    if (keyInput) keyInput.value = '';
    appState.apiKey = '';
    saveStateToStorage();
    updateApiStatusBadge();
    showToast('API key removed.', 'info');
}

function updateApiStatusBadge() {
    const statusText = document.getElementById('api-status-text');
    const statusBadge = document.getElementById('api-status-badge');
    const engineIndicator = document.getElementById('api-engine-indicator');

    if (appState.apiKey) {
        if (statusText) statusText.textContent = `Live AI (${appState.selectedModel})`;
        if (statusBadge) {
            statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/90 dark:bg-emerald-950 border border-emerald-500/40 text-emerald-400 cursor-pointer hover:bg-emerald-900/60 transition';
        }
        if (engineIndicator) engineIndicator.textContent = `Engine: Google AI Studio (${appState.selectedModel})`;
    } else {
        if (statusText) statusText.textContent = 'Key Required (Fallback Mode)';
        if (statusBadge) {
            statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-amber-500/30 text-amber-400 cursor-pointer hover:bg-zinc-800 transition';
        }
        if (engineIndicator) engineIndicator.textContent = 'Engine: Offline Simulator';
    }
}

// Dashboard & Stats Renderer
function renderDashboard() {
    setTextContent('stat-total-minutes', appState.totalMinutes);
    setTextContent('stat-quests-count', appState.questsCount);
    setTextContent('stat-scans-count', appState.scansCount);
    setTextContent('stat-streak-days', appState.streakDays);

    setTextContent('ticker-uptime', `${appState.totalMinutes} mins`);
    setTextContent('ticker-streak', `${appState.streakDays} Days`);
    
    // Level calculation (1 Level per 50 XP)
    const levelNum = Math.floor(appState.xp / 50) + 1;
    const levelTitles = ['Seedling', 'Sprout Handler', 'Fern Debugger', 'Tree Whisperer', 'Forest Architect', 'Grass Guru'];
    const levelTitle = levelTitles[Math.min(levelNum - 1, levelTitles.length - 1)];
    setTextContent('ticker-level', `Lvl ${levelNum} ${levelTitle}`);

    // Uptime bar progress towards daily goal (60 mins)
    const percentage = Math.min(100, Math.round((appState.totalMinutes / 60) * 100));
    const bar = document.getElementById('stat-uptime-bar');
    if (bar) bar.style.width = `${percentage}%`;

    checkBadgeUnlocks();
}

// Quest Engine Logic
function setupActiveQuest() {
    if (!appState.activeQuest) {
        appState.activeQuest = QUEST_CATALOG[0];
        saveStateToStorage();
    }
    renderActiveQuestCard();
}

function renderActiveQuestCard() {
    const q = appState.activeQuest;
    if (!q) return;

    setTextContent('active-quest-title', q.title);
    setTextContent('active-quest-desc', q.desc);
    setTextContent('quest-difficulty-badge', `${q.difficulty} • ${q.xp} XP`);
    setTextContent('quest-time', `${q.timeMins} mins`);
    setTextContent('quest-reward', `+${q.timeMins} Mins Outdoor Uptime`);
}

function completeActiveQuest() {
    const q = appState.activeQuest;
    if (!q) return;

    appState.totalMinutes += q.timeMins;
    appState.questsCount += 1;
    appState.xp += q.xp;

    // Add activity log
    appState.history.unshift({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Quest Completed',
        detail: q.title,
        minutesAdded: `+${q.timeMins} mins`,
        status: 'Completed'
    });

    // Pick next random quest
    const remaining = QUEST_CATALOG.filter(item => item.id !== q.id);
    appState.activeQuest = remaining[Math.floor(Math.random() * remaining.length)];

    saveStateToStorage();
    renderDashboard();
    renderActiveQuestCard();
    renderHistoryTable();

    showToast(`🎉 Quest completed! +${q.timeMins} mins outdoor uptime logged.`, 'success');
}

function rerollQuest() {
    const remaining = QUEST_CATALOG.filter(item => item.id !== (appState.activeQuest ? appState.activeQuest.id : ''));
    appState.activeQuest = remaining[Math.floor(Math.random() * remaining.length)];
    saveStateToStorage();
    renderActiveQuestCard();
    showToast('Quest rerolled!', 'info');
}

function rerollAllQuests() {
    rerollQuest();
    renderQuests();
}

function selectQuestToActive(questId) {
    const target = QUEST_CATALOG.find(q => q.id === questId);
    if (target) {
        appState.activeQuest = target;
        saveStateToStorage();
        renderActiveQuestCard();
        showToast(`Accepted quest: "${target.title}"`, 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function filterQuests(category) {
    appState.questsFilter = category;
    
    // Update filter UI buttons
    document.querySelectorAll('.quest-filter-btn').forEach(btn => {
        if (btn.getAttribute('data-cat') === category) {
            btn.className = 'quest-filter-btn px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-zinc-950';
        } else {
            btn.className = 'quest-filter-btn px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-white';
        }
    });

    renderQuests();
}

function renderQuests() {
    const container = document.getElementById('quest-list-container');
    if (!container) return;

    let filtered = QUEST_CATALOG;
    if (appState.questsFilter !== 'all') {
        filtered = QUEST_CATALOG.filter(q => q.category === appState.questsFilter);
    }

    container.innerHTML = filtered.map(q => `
        <div class="bg-white/80 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 rounded-2xl p-4 transition flex items-center justify-between gap-3 group">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition">
                    <i data-lucide="${q.icon}" class="w-4 h-4"></i>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">${q.title}</h4>
                    <p class="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">${q.desc}</p>
                    <div class="flex items-center gap-3 mt-1 text-[11px] font-mono text-zinc-500">
                        <span>${q.timeMins} Mins</span>
                        <span>•</span>
                        <span class="text-emerald-600 dark:text-emerald-400 font-bold">+${q.xp} XP</span>
                    </div>
                </div>
            </div>
            <button onclick="selectQuestToActive('${q.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-slate-200 dark:border-zinc-800 transition shrink-0">
                Accept
            </button>
        </div>
    `).join('');

    initLucideIcons();
}

// Badges Engine
function renderBadges() {
    const grid = document.getElementById('badges-grid');
    if (!grid) return;

    grid.innerHTML = BADGES_CATALOG.map(b => {
        const isUnlocked = appState.unlockedBadges.includes(b.id);
        return `
            <div class="p-3 rounded-2xl border text-center transition ${
                isUnlocked 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300 badge-unlocked' 
                : 'bg-slate-100/60 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-60'
            }" title="${b.desc}">
                <div class="w-8 h-8 rounded-full ${isUnlocked ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400' : 'bg-slate-200 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'} flex items-center justify-center mx-auto mb-1.5">
                    <i data-lucide="${b.icon}" class="w-4 h-4"></i>
                </div>
                <h5 class="text-[11px] font-bold tracking-tight">${b.name}</h5>
                <span class="text-[9px] font-mono block mt-0.5 ${isUnlocked ? 'text-amber-600 dark:text-amber-400/80 font-bold' : 'text-zinc-500 dark:text-zinc-600'}">${isUnlocked ? 'Unlocked' : 'Locked'}</span>
            </div>
        `;
    }).join('');

    initLucideIcons();
}

function checkBadgeUnlocks() {
    let newlyUnlocked = false;

    BADGES_CATALOG.forEach(b => {
        if (!appState.unlockedBadges.includes(b.id)) {
            let eligible = false;
            if (b.reqType === 'quests' && appState.questsCount >= b.reqVal) eligible = true;
            if (b.reqType === 'minutes' && appState.totalMinutes >= b.reqVal) eligible = true;
            if (b.reqType === 'scans' && appState.scansCount >= b.reqVal) eligible = true;
            if (b.reqType === 'streak' && appState.streakDays >= b.reqVal) eligible = true;
            if (b.reqType === 'xp' && appState.xp >= b.reqVal) eligible = true;

            if (eligible) {
                appState.unlockedBadges.push(b.id);
                newlyUnlocked = true;
                showToast(`🏆 Badge Unlocked: ${b.name}!`, 'success');
            }
        }
    });

    if (newlyUnlocked) {
        saveStateToStorage();
        renderBadges();
    }
}

// FloraFind Input Switcher & Presets
function switchFloraTab(tab) {
    appState.currentTab = tab;
    const textTabBtn = document.getElementById('tab-btn-text');
    const imgTabBtn = document.getElementById('tab-btn-image');
    const textInputDiv = document.getElementById('flora-input-text');
    const imgInputDiv = document.getElementById('flora-input-image');

    if (tab === 'text') {
        if (textTabBtn) textTabBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold font-mono transition bg-emerald-500 text-zinc-950 flex items-center gap-2';
        if (imgTabBtn) imgTabBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold font-mono transition bg-slate-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2';
        if (textInputDiv) textInputDiv.classList.remove('hidden');
        if (imgInputDiv) imgInputDiv.classList.add('hidden');
    } else {
        if (imgTabBtn) imgTabBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold font-mono transition bg-emerald-500 text-zinc-950 flex items-center gap-2';
        if (textTabBtn) textTabBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold font-mono transition bg-slate-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2';
        if (imgInputDiv) imgInputDiv.classList.remove('hidden');
        if (textInputDiv) textInputDiv.classList.add('hidden');
    }
}

function setPlantPreset(text) {
    const input = document.getElementById('plant-description-input');
    if (input) input.value = text;
}

function handleImageSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size must be under 5MB', 'error');
        return;
    }

    appState.selectedImageMime = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onload = function (e) {
        const fullDataUrl = e.target.result;
        appState.selectedImageBase64 = fullDataUrl.split(',')[1];
        
        const imgPrev = document.getElementById('uploaded-image-preview');
        if (imgPrev) imgPrev.src = fullDataUrl;
        
        const promptView = document.getElementById('upload-prompt-view');
        if (promptView) promptView.classList.add('hidden');
        
        const prevView = document.getElementById('upload-preview-view');
        if (prevView) prevView.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function clearSelectedImage(e) {
    if (e) e.stopPropagation();
    appState.selectedImageBase64 = '';
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) fileInput.value = '';
    const prevView = document.getElementById('upload-preview-view');
    if (prevView) prevView.classList.add('hidden');
    const promptView = document.getElementById('upload-prompt-view');
    if (promptView) promptView.classList.remove('hidden');
}

// Dynamic Model Discovery via ModelService.ListModels
async function fetchAvailableModels(key) {
    try {
        const res = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {}, 5000);
        if (res.ok) {
            const data = await res.json();
            if (data.models && Array.isArray(data.models)) {
                const validModels = data.models
                    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
                if (validModels.length > 0) {
                    return validModels;
                }
            }
        }
    } catch (e) {
        console.warn('Model discovery failed:', e);
    }
    return [];
}

// Flora Analysis Engine with Animated Progress Bar
async function analyzeFloraWithGemma() {
    if (!appState.apiKey) {
        showToast('No API Key found. Using Fallback Simulator Mode. Open Key Settings to enter your key.', 'info');
        const mockRes = getMockGemmaAnalysis();
        appState.lastAnalysis = mockRes;
        renderFloraResult(mockRes);
        return;
    }

    const loadingOverlay = document.getElementById('gemma-loading-overlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    // Dynamic multi-stage ticker sequence
    const STAGES = [
        { threshold: 0, text: 'Connecting to Google AI Studio API...', step: '[Step 1/6]' },
        { threshold: 18, text: 'Parsing leaf chlorophyll & geometry...', step: '[Step 2/6]' },
        { threshold: 40, text: 'Querying Gemma candidate models...', step: '[Step 3/6]' },
        { threshold: 60, text: 'Compiling hardware specs & SLA notes...', step: '[Step 4/6]' },
        { threshold: 78, text: 'Generating developer patch notes...', step: '[Step 5/6]' },
        { threshold: 90, text: 'Finalizing botanical JSON payload...', step: '[Step 6/6]' },
        { threshold: 95, text: 'Deep model processing... Hang tight, final touch!', step: '[Step 6/6]' }
    ];

    let progress = 0;
    updateProgress(0, STAGES[0].text, STAGES[0].step);
    
    // Continuous progress runner with adaptive speed curve (never freezes!)
    const progressInterval = setInterval(() => {
        if (progress < 98) {
            let increment = 0;
            if (progress < 35) {
                increment = Math.random() * 4 + 3; // +3% to +7% initial burst
            } else if (progress < 70) {
                increment = Math.random() * 2.5 + 1.2; // +1.2% to +3.7% steady progression
            } else if (progress < 88) {
                increment = Math.random() * 1.2 + 0.5; // +0.5% to +1.7% micro-steps
            } else {
                increment = Math.random() * 0.4 + 0.15; // +0.15% to +0.55% continuous crawl (prevents freeze feel)
            }
            
            progress = Math.min(98, progress + increment);
            
            // Determine active stage text & step count
            let currentStage = STAGES[0];
            for (let i = STAGES.length - 1; i >= 0; i--) {
                if (progress >= STAGES[i].threshold) {
                    currentStage = STAGES[i];
                    break;
                }
            }
            
            updateProgress(progress, currentStage.text, currentStage.step);
        }
    }, 120);

    try {
        // Enforce an optimal 19-second master request deadline for open-weight Gemma models
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timed out (19s threshold exceeded)')), 19000)
        );

        let resultObj = await Promise.race([
            callGoogleAiStudioGemmaAPI(),
            timeoutPromise
        ]);

        clearInterval(progressInterval);
        
        // Complete progress bar to 100% with celebration state
        updateProgress(100, '🎉 Analysis complete! Rendering results...', '[Step 6/6]');
        await new Promise(r => setTimeout(r, 450));

        if (resultObj) {
            appState.lastAnalysis = resultObj;
            renderFloraResult(resultObj);
            showToast('Botanical analysis completed via Google AI Studio!', 'success');
        }
    } catch (err) {
        clearInterval(progressInterval);
        console.warn('Google AI Studio API call failed or timed out:', err);
        showToast(`API Timeout/Error: ${err.message || 'Call failed'}. Switched to Fallback Mode.`, 'error');
        const fallback = getMockGemmaAnalysis();
        appState.lastAnalysis = fallback;
        renderFloraResult(fallback);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

// Helper: Extract valid JSON object from LLM response text
function extractJSON(text) {
    if (!text) return null;
    let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {}

    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        } catch (e) {}
    }
    return null;
}

// Prompt Payload Builder
function buildPromptPayload() {
    const systemPrompt = `You are FloraFind AI, an open-weight botanical compiler built for developers touching grass. 
Analyze the provided plant text or image. Respond ONLY with a valid JSON object strictly matching this schema without markdown block tags:
{
  "plantName": "Real Name (Common Name)",
  "devClass": "humorous.dev.PackageClass",
  "hardwareSpecs": "Hardware redundancy description phrased as tech specs",
  "photosynthesisUptime": "Percentage or SLA description",
  "patchNotes": "Hilarious developer patch note / warning for this plant",
  "rarity": "Common Specimen | Uncommon Specimen | Rare Specimen | Epic Specimen | Legendary Specimen",
  "xpPoints": 25
}`;

    let promptText = "";
    if (appState.currentTab === 'text') {
        const descInputEl = document.getElementById('plant-description-input');
        const descInput = descInputEl ? descInputEl.value.trim() : '';
        promptText = `${systemPrompt}\n\nUser Description of Plant: "${descInput || 'Wild green clover in grass'}"`;
    } else {
        promptText = `${systemPrompt}\n\nAnalyze this uploaded botanical specimen image.`;
    }

    const partsArray = [{ text: promptText }];

    if (appState.currentTab === 'image' && appState.selectedImageBase64) {
        partsArray.push({
            inline_data: {
                mime_type: appState.selectedImageMime,
                data: appState.selectedImageBase64
            }
        });
    }

    return partsArray;
}

// Fast API Caller: Direct fetch to secured model with strict timeouts
async function callGoogleAiStudioGemmaAPI() {
    const key = appState.apiKey.trim();
    if (!key) {
        throw new Error('API Key is empty');
    }

    const partsArray = buildPromptPayload();

    // 1. FAST PATH: Attempt direct call on currently secured model (19s budget)
    if (appState.selectedModel) {
        try {
            const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${appState.selectedModel}:generateContent?key=${key}`;
            const res = await fetchWithTimeout(directUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: partsArray }] })
            }, 19000);

            if (res.ok) {
                const json = await res.json();
                const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const parsed = extractJSON(responseText);
                if (parsed && parsed.plantName) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn(`Direct fetch to ${appState.selectedModel} failed or timed out (19s limit), falling back to candidate sweep...`, e);
        }
    }

    // 2. FALLBACK PATH: Candidate sweep if direct call fails (5s per candidate)
    const discovered = await fetchAvailableModels(key);
    const modelsToTry = [...new Set([...discovered, ...MODEL_CANDIDATE_LIST])];
    const apiVersions = ['v1beta', 'v1'];

    let firstError = null;

    for (const apiVer of apiVersions) {
        for (const model of modelsToTry) {
            try {
                const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${key}`;
                const response = await fetchWithTimeout(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: partsArray }] })
                }, 5000);

                if (!response.ok) {
                    const errJson = await response.json().catch(() => ({}));
                    const errMsg = errJson?.error?.message || `HTTP ${response.status} (${model})`;
                    if (!firstError) firstError = new Error(errMsg);
                    continue;
                }

                const json = await response.json();
                const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                const parsed = extractJSON(responseText);
                if (parsed && parsed.plantName) {
                    appState.selectedModel = model;
                    updateApiStatusBadge();
                    return parsed;
                }
            } catch (err) {
                if (!firstError) firstError = err;
            }
        }
    }

    throw firstError || new Error('API request failed across candidate model endpoints.');
}

function getMockGemmaAnalysis() {
    const descEl = document.getElementById('plant-description-input');
    const inputVal = descEl ? descEl.value.toLowerCase() : '';
    
    if (inputVal.includes('pine') || inputVal.includes('tree')) {
        return MOCK_GEMMA_RESPONSES[2];
    } else if (inputVal.includes('dandelion') || inputVal.includes('yellow')) {
        return MOCK_GEMMA_RESPONSES[1];
    } else if (inputVal.includes('moss')) {
        return MOCK_GEMMA_RESPONSES[3];
    } else if (inputVal.includes('sunflower')) {
        return MOCK_GEMMA_RESPONSES[4];
    }
    
    // Pick random fallback response
    return MOCK_GEMMA_RESPONSES[Math.floor(Math.random() * MOCK_GEMMA_RESPONSES.length)];
}

function renderFloraResult(res) {
    if (!res) return;
    setTextContent('res-plant-name', res.plantName || 'Unknown Specimen');
    setTextContent('res-dev-class', res.devClass || 'java.lang.Object');
    setTextContent('res-hardware-specs', res.hardwareSpecs || 'Standard biological specs');
    setTextContent('res-photosynthesis', res.photosynthesisUptime || '100% SLA');
    setTextContent('res-patch-notes', res.patchNotes ? `"${res.patchNotes}"` : '"No patch notes available."');
    setTextContent('res-rarity-badge', res.rarity || 'Common Specimen');
    setTextContent('res-xp-earned', `+${res.xpPoints || 25} XP`);

    const resultBox = document.getElementById('flora-result-box');
    if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function logAnalysisToDashboard() {
    if (!appState.lastAnalysis) return;
    const res = appState.lastAnalysis;

    appState.scansCount += 1;
    appState.totalMinutes += 10; // Bonus minutes for botanical research
    appState.xp += res.xpPoints || 25;

    appState.history.unshift({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Gemma Flora Scan',
        detail: res.plantName,
        minutesAdded: '+10 mins',
        status: 'Logged'
    });

    saveStateToStorage();
    renderDashboard();
    renderHistoryTable();

    showToast(`Logged ${res.plantName}! +10 Mins & +${res.xpPoints || 25} XP added.`, 'success');
}

// History Table Renderer
function renderHistoryTable() {
    const tbody = document.getElementById('activity-log-table-body');
    const emptyNotice = document.getElementById('empty-history-notice');
    if (!tbody) return;

    if (!appState.history || appState.history.length === 0) {
        tbody.innerHTML = '';
        if (emptyNotice) emptyNotice.classList.remove('hidden');
        return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    tbody.innerHTML = appState.history.map(row => `
        <tr class="hover:bg-slate-100/50 dark:hover:bg-zinc-900/40 transition">
            <td class="py-3 px-4 text-zinc-500">${row.timestamp}</td>
            <td class="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">${row.type}</td>
            <td class="py-3 px-4 text-zinc-800 dark:text-zinc-200">${row.detail}</td>
            <td class="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">${row.minutesAdded}</td>
            <td class="py-3 px-4 text-right">
                <span class="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border border-emerald-500/20">${row.status}</span>
            </td>
        </tr>
    `).join('');
}

function clearHistoryLog() {
    appState.history = [];
    saveStateToStorage();
    renderHistoryTable();
    showToast('Activity log cleared.', 'info');
}

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200' :
               type === 'error' ? 'bg-red-950 border-red-500/50 text-red-200' :
               'bg-zinc-900 border-zinc-700 text-zinc-200';

    toast.className = `p-4 rounded-2xl border ${bg} shadow-xl text-xs font-medium flex items-center justify-between gap-3 animate-toast`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="text-zinc-400 hover:text-white">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4500);
}
