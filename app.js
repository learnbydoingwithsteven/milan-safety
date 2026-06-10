// milan-safety/app.js

let activeLanguage = "en";
let activePrimaryView = "stats";
let activeMapLayerMode = "heatmap";
let isApplyingInitialUrlState = false;

let officialRecords = [];
let officialLoadState = {
  status: "idle",
  error: "",
  fetchedAt: null,
  method: "",
  rawCount: 0
};

let newsRecords = [];
let newsLoadState = {
  status: "idle",
  error: "",
  fetchedAt: null,
  method: "",
  requested: { 2026: 20, 2025: 40 },
  received: { 2026: 0, 2025: 0 }
};

const officialFilters = {
  category: "all",
  year: "all"
};

const newsFilters = {
  category: "all",
  year: "all"
};

const searchQueries = {
  stats: "",
  news: ""
};

let map;
let mapReady = false;
let newsHeatLayerGroup;
let newsMarkerLayerGroup;

let categoryChart;
let annualChart;
let sourceChart;
let chartsReady = false;

const localeByLanguage = {
  en: "en-US",
  zh: "zh-CN",
  it: "it-IT"
};

const allowedOfficialDataHosts = new Set(["dati.comune.milano.it"]);

const newsHeatmapConfig = {
  sourceName: "Curated source-linked Milan crime news CSV",
  csvUrl: "20260609gptdata/milan_crime_news_2025_2026.csv",
  note: "Real source-linked records supplied as CSV. Rows keep source_url, source, headline, publication_date, legal_status, notes, and retrieved_date. Location coordinates are processed from the CSV location fields for visualization only."
};

const newsCategories = [
  { value: "all", label: "All News Types" },
  { value: "robbery", label: "Robbery / Theft" },
  { value: "assault", label: "Assault / Stabbing" },
  { value: "drugs", label: "Drugs / Dealing" },
  { value: "weapons", label: "Weapons" },
  { value: "publicOrder", label: "Public Order" },
  { value: "fraud", label: "Fraud" },
  { value: "other", label: "Other Safety News" }
];

const milanNewsGazetteer = [
  { name: "Stazione Centrale", lat: 45.4862, lng: 9.2044, keywords: ["stazione centrale", "centrale", "piazza duca d'aosta"] },
  { name: "Duomo", lat: 45.4642, lng: 9.19, keywords: ["duomo", "piazza duomo", "galleria vittorio emanuele"] },
  { name: "Navigli / Darsena", lat: 45.452, lng: 9.174, keywords: ["navigli", "darsena", "ripa di porta ticinese"] },
  { name: "Porta Venezia", lat: 45.475, lng: 9.205, keywords: ["porta venezia", "corso buenos aires"] },
  { name: "Porta Garibaldi", lat: 45.484, lng: 9.188, keywords: ["porta garibaldi", "garibaldi", "corso como"] },
  { name: "Porta Romana", lat: 45.452, lng: 9.202, keywords: ["porta romana", "corso lodi"] },
  { name: "Corvetto", lat: 45.438, lng: 9.224, keywords: ["corvetto", "piazzale corvetto"] },
  { name: "Rogoredo", lat: 45.433, lng: 9.238, keywords: ["rogoredo", "boschetto di rogoredo"] },
  { name: "Lambrate", lat: 45.482, lng: 9.236, keywords: ["lambrate", "citta studi", "città studi"] },
  { name: "Loreto / NoLo", lat: 45.491, lng: 9.219, keywords: ["loreto", "nolo", "via padova"] },
  { name: "Quarto Oggiaro", lat: 45.514, lng: 9.139, keywords: ["quarto oggiaro"] },
  { name: "Bovisa", lat: 45.503, lng: 9.16, keywords: ["bovisa", "dorgali"] },
  { name: "Niguarda", lat: 45.517, lng: 9.19, keywords: ["niguarda"] },
  { name: "Bicocca", lat: 45.514, lng: 9.211, keywords: ["bicocca"] },
  { name: "Isola", lat: 45.488, lng: 9.19, keywords: ["isola", "piazza gae aulenti"] },
  { name: "Chinatown / Paolo Sarpi", lat: 45.481, lng: 9.18, keywords: ["paolo sarpi", "chinatown"] },
  { name: "Brera", lat: 45.472, lng: 9.188, keywords: ["brera"] },
  { name: "San Siro", lat: 45.478, lng: 9.123, keywords: ["san siro", "piazzale lotto", "lotto"] },
  { name: "Giambellino", lat: 45.454, lng: 9.14, keywords: ["giambellino", "lorenteggio"] },
  { name: "Barona", lat: 45.435, lng: 9.156, keywords: ["barona"] },
  { name: "Gratosoglio", lat: 45.412, lng: 9.173, keywords: ["gratosoglio"] },
  { name: "Famagosta", lat: 45.436, lng: 9.168, keywords: ["famagosta"] },
  { name: "CityLife", lat: 45.478, lng: 9.156, keywords: ["citylife", "tre torri"] },
  { name: "Affori", lat: 45.516, lng: 9.174, keywords: ["affori"] },
  { name: "Baggio", lat: 45.463, lng: 9.089, keywords: ["baggio"] },
  { name: "Milano Citywide", lat: 45.4642, lng: 9.19, keywords: ["milano", "milan"] }
];

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch(error => {
    console.error("Milan Safety Map failed to initialize:", error);
    officialLoadState = { ...officialLoadState, status: "error", error: error.message || String(error) };
    renderActiveView();
  });
});

async function bootstrap() {
  const initialUrlState = readInitialUrlState();
  isApplyingInitialUrlState = true;
  initLanguage(initialUrlState.language);
  setupEventListeners();
  initCharts();
  setMapLayerMode(initialUrlState.layer, { skipRender: true, skipUrlSync: true });
  applyInitialFilters(initialUrlState);
  setPrimaryView(initialUrlState.view, { skipRender: true, skipUrlSync: true });
  renderLoadingState();
  await loadOfficialCrimeData();
  applyInitialFilters(initialUrlState);
  populateControls();
  syncSearchInput();
  renderActiveView();
  isApplyingInitialUrlState = false;
  syncUrlState({ replace: true });
}

function initLanguage(preferredLanguage) {
  const savedLang = localStorage.getItem("milan_safety_lang");
  if (preferredLanguage && ["en", "zh", "it"].includes(preferredLanguage)) {
    activeLanguage = preferredLanguage;
  } else if (savedLang && ["en", "zh", "it"].includes(savedLang)) {
    activeLanguage = savedLang;
  }
  document.querySelectorAll(".lang-btn").forEach(item => item.classList.toggle("active", item.dataset.lang === activeLanguage));
}

function readInitialUrlState() {
  const params = new URLSearchParams(window.location.search);
  const viewParam = (params.get("view") || "").toLowerCase();
  const layerParam = (params.get("layer") || params.get("map") || "").toLowerCase();
  const languageParam = (params.get("lang") || params.get("language") || "").toLowerCase();

  return {
    view: viewParam === "news" || viewParam === "heatmap" || viewParam === "map" ? "news" : "stats",
    layer: ["marker", "markers", "pins", "pin", "source", "sources"].includes(layerParam) ? "markerPins" : "heatmap",
    language: languageParam === "cn" ? "zh" : (["en", "zh", "it"].includes(languageParam) ? languageParam : ""),
    category: params.get("category") || params.get("type") || "all",
    year: params.get("year") || params.get("period") || "all",
    search: params.get("search") || params.get("q") || ""
  };
}

function applyInitialFilters(state) {
  const category = state.category || "all";
  const year = state.year || "all";
  const search = state.search || "";

  if (state.view === "news") {
    newsFilters.category = category;
    newsFilters.year = year;
    searchQueries.news = search;
  } else {
    officialFilters.category = category;
    officialFilters.year = year;
    searchQueries.stats = search;
  }
}

function syncSearchInput() {
  const searchInput = document.getElementById("feed-search");
  if (searchInput) searchInput.value = searchQueries[activePrimaryView] || "";
}

function syncUrlState(options = {}) {
  if (isApplyingInitialUrlState || !window.history || !window.location) return;

  const params = new URLSearchParams(window.location.search);
  const activeFilters = activePrimaryView === "news" ? newsFilters : officialFilters;
  const activeSearch = (searchQueries[activePrimaryView] || "").trim();

  setOrDeleteParam(params, "view", activePrimaryView === "news" ? "news" : "");
  setOrDeleteParam(params, "layer", activePrimaryView === "news" && activeMapLayerMode === "markerPins" ? "marker" : "");
  setOrDeleteParam(params, "lang", activeLanguage !== "en" ? activeLanguage : "");
  setOrDeleteParam(params, "category", activeFilters.category !== "all" ? activeFilters.category : "");
  setOrDeleteParam(params, "year", activeFilters.year !== "all" ? activeFilters.year : "");
  setOrDeleteParam(params, "search", activeSearch);

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (nextUrl === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;

  const method = options.replace === false ? "pushState" : "replaceState";
  window.history[method](null, "", nextUrl);
}

function setOrDeleteParam(params, key, value) {
  if (value === undefined || value === null || value === "") params.delete(key);
  else params.set(key, value);
}

function t(key, fallback) {
  return (translationDictionary[activeLanguage] && translationDictionary[activeLanguage][key])
    || translationDictionary.en[key]
    || fallback
    || key;
}

function getLocale() {
  return localeByLanguage[activeLanguage] || "en-US";
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function getSafeExternalUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
  } catch {
    return "#";
  }
}

function renderLoadingState() {
  setText("#data-source-summary", "Loading official DS564 records...");
  const feed = document.getElementById("incident-feed-items");
  if (feed) {
    feed.innerHTML = '<div class="feed-empty-state">Loading official data...</div>';
  }
}

async function loadOfficialCrimeData() {
  officialLoadState = { status: "loading", error: "", fetchedAt: null, method: "", rawCount: 0 };

  const attempts = [
    { label: "CKAN Data API fetch", run: () => fetchJson(officialCrimeDataset.apiUrl, allowedOfficialDataHosts) },
    { label: "CKAN Data API JSONP", run: () => loadJsonp(officialCrimeDataset.apiUrl, allowedOfficialDataHosts) },
    { label: "Official JSON file fetch", run: () => fetchJson(officialCrimeDataset.jsonUrl, allowedOfficialDataHosts) },
    { label: "Official CSV file fetch", run: async () => parseDelimitedRows(await fetchText(officialCrimeDataset.csvUrl, allowedOfficialDataHosts)) }
  ];

  const errors = [];
  for (const attempt of attempts) {
    try {
      const payload = await attempt.run();
      const rows = Array.isArray(payload) && payload[0] && typeof payload[0] === "object"
        ? payload
        : extractRows(payload);
      const parsedRecords = normalizeOfficialRows(rows);
      if (!parsedRecords.length) throw new Error("No parseable records found.");
      officialRecords = parsedRecords;
      officialLoadState = {
        status: "loaded",
        error: "",
        fetchedAt: new Date(),
        method: attempt.label,
        rawCount: rows.length
      };
      return;
    } catch (error) {
      errors.push(`${attempt.label}: ${error.message || error}`);
    }
  }

  officialRecords = [];
  officialLoadState = {
    status: "error",
    error: errors.join(" | "),
    fetchedAt: null,
    method: "",
    rawCount: 0
  };
}

async function fetchJson(url, allowedHosts) {
  const safeUrl = getAllowedUrl(url, allowedHosts);
  const response = await fetch(safeUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url, allowedHosts) {
  const safeUrl = getAllowedUrl(url, allowedHosts);
  const response = await fetch(safeUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function getAllowedUrl(url, allowedHosts) {
  const parsed = new URL(url, window.location.href);
  if (parsed.protocol !== "https:" || !allowedHosts.has(parsed.hostname)) {
    throw new Error(`Blocked non-allowed source URL: ${parsed.href}`);
  }
  return parsed.href;
}

function loadJsonp(url, allowedHosts, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    let safeUrl;
    try {
      safeUrl = getAllowedUrl(url, allowedHosts);
    } catch (error) {
      reject(error);
      return;
    }

    const callbackName = `milanSafetyJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;

    function cleanup() {
      settled = true;
      delete window[callbackName];
      script.remove();
    }

    const timeout = window.setTimeout(() => {
      if (settled) return;
      cleanup();
      reject(new Error("JSONP timeout"));
    }, timeoutMs);

    window[callbackName] = payload => {
      if (settled) return;
      window.clearTimeout(timeout);
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      if (settled) return;
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error("JSONP script failed"));
    };

    const parsedUrl = new URL(safeUrl);
    parsedUrl.searchParams.set("callback", callbackName);
    script.src = parsedUrl.href;
    document.head.appendChild(script);
  });
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "string") return parseDelimitedRows(payload);
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.result && payload.result.records,
    payload.records,
    payload.data,
    payload.items,
    payload.features && payload.features.map(feature => feature.properties || feature)
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function parseDelimitedRows(text) {
  const normalized = String(text || "").replace(/^\uFEFF/, "");
  const firstLine = normalized.split(/\r?\n/, 1)[0] || "";
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const table = parseDelimitedTable(normalized, delimiter).filter(row => row.some(cell => String(cell).trim() !== ""));
  if (table.length < 2) return [];

  const headers = table[0].map(header => String(header || "").trim());
  return table.slice(1).map(row => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function parseDelimitedTable(text, delimiter) {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"" && inQuotes && nextChar === "\"") {
      currentCell += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  currentRow.push(currentCell);
  rows.push(currentRow);
  return rows;
}

function normalizeOfficialRows(rows) {
  if (!Array.isArray(rows)) return [];
  const records = [];

  rows.forEach((row, index) => {
    if (!row || typeof row !== "object") return;

    const year = parseYear(getValueByAliases(row, ["anno_rilevamento_reato", "anno", "year"]));
    if (!year) return;

    const type = cleanCrimeType(getValueByAliases(row, [
      "Reati_denunciati_tipologia",
      "reati_denunciati_tipologia",
      "tipologia",
      "tipo",
      "reato",
      "serie_storica"
    ]));
    const count = parseOfficialNumber(getValueByAliases(row, [
      "reati_denunciati",
      "valore",
      "totale",
      "numero",
      "count",
      "value"
    ]));

    if (type && Number.isFinite(count)) {
      records.push(makeOfficialRecord(year, type, count, row, index));
      return;
    }

    Object.entries(row).forEach(([field, value]) => {
      if (isWideFormatIgnoredField(field)) return;
      const parsedValue = parseOfficialNumber(value);
      if (!Number.isFinite(parsedValue)) return;
      records.push(makeOfficialRecord(year, cleanCrimeType(field), parsedValue, row, index));
    });
  });

  return dedupeOfficialRecords(records).sort((a, b) => (
    a.year - b.year
    || a.type.localeCompare(b.type, "it-IT")
    || a.count - b.count
  ));
}

function getValueByAliases(row, aliases) {
  const entries = Object.entries(row);
  const normalizedAliases = aliases.map(normalizeFieldName);
  for (const [key, value] of entries) {
    if (normalizedAliases.includes(normalizeFieldName(key))) return value;
  }
  return undefined;
}

function normalizeFieldName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseYear(value) {
  const match = String(value ?? "").match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  const year = Number(match[0]);
  return year >= 1900 && year <= 2100 ? year : null;
}

function parseOfficialNumber(value) {
  if (value === null || value === undefined) return NaN;
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;

  const raw = String(value).trim();
  if (!raw || raw === "-" || raw.toLowerCase() === "na") return NaN;

  let normalized = raw.replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  if (!normalized || normalized === "-") return NaN;

  const dotCount = (normalized.match(/\./g) || []).length;
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  } else if (dotCount > 1 || /\.\d{3}($|\.)/.test(normalized)) {
    normalized = normalized.replace(/\./g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : NaN;
}

function cleanCrimeType(value) {
  return String(value ?? "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function isWideFormatIgnoredField(field) {
  const normalized = normalizeFieldName(field);
  return [
    "id",
    "anno",
    "year",
    "annorilevamentoreato",
    "reatidenunciatitipologia",
    "tipologia",
    "tipo",
    "reato",
    "seriestorica",
    "codice",
    "geo"
  ].includes(normalized) || normalized.startsWith("id");
}

function makeOfficialRecord(year, type, count, raw, index) {
  const cleanType = cleanCrimeType(type);
  return {
    id: `${year}-${slugify(cleanType)}-${index}`,
    year,
    type: cleanType,
    count: Math.max(0, Math.round(count)),
    isTotal: isTotalType(cleanType),
    sourceIds: ["comune-milano-ds564", "comune-milano-api", "comune-milano-csv"],
    raw
  };
}

function dedupeOfficialRecords(records) {
  const seen = new Set();
  return records.filter(record => {
    const key = `${record.year}|${record.type}|${record.count}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "record";
}

function isTotalType(type) {
  return normalizeFieldName(type).includes("totale");
}

function setupEventListeners() {
  document.querySelectorAll("[data-primary-view]").forEach(button => {
    button.addEventListener("click", () => setPrimaryView(button.dataset.primaryView));
  });

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeLanguage = btn.dataset.lang;
      localStorage.setItem("milan_safety_lang", activeLanguage);
      document.querySelectorAll(".lang-btn").forEach(item => item.classList.toggle("active", item.dataset.lang === activeLanguage));
      populateControls();
      renderActiveView();
      syncUrlState({ replace: true });
    });
  });

  const layerButtons = {
    "btn-heatmap": "heatmap",
    "btn-marker": "markerPins"
  };
  Object.entries(layerButtons).forEach(([id, mode]) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener("click", () => setMapLayerMode(mode));
  });

  document.getElementById("filter-category")?.addEventListener("change", event => {
    if (activePrimaryView === "stats") officialFilters.category = event.target.value;
    else newsFilters.category = event.target.value;
    renderActiveView();
    syncUrlState({ replace: true });
  });

  document.getElementById("filter-exact-month")?.addEventListener("change", event => {
    if (activePrimaryView === "stats") officialFilters.year = event.target.value;
    else newsFilters.year = event.target.value;
    renderActiveView();
    syncUrlState({ replace: true });
  });

  document.getElementById("feed-search")?.addEventListener("input", event => {
    searchQueries[activePrimaryView] = event.target.value;
    renderActiveView();
    syncUrlState({ replace: true });
  });
}

function setMapLayerMode(mode, options = {}) {
  activeMapLayerMode = mode === "markerPins" ? "markerPins" : "heatmap";
  document.getElementById("btn-heatmap")?.classList.toggle("active", activeMapLayerMode === "heatmap");
  document.getElementById("btn-marker")?.classList.toggle("active", activeMapLayerMode === "markerPins");
  if (!options.skipRender) renderActiveView();
  if (!options.skipUrlSync) syncUrlState({ replace: true });
}

function setPrimaryView(view, options = {}) {
  activePrimaryView = view;
  const app = document.getElementById("app-container");
  if (app) {
    app.classList.toggle("mode-stats", view === "stats");
    app.classList.toggle("mode-news", view === "news");
  }

  document.querySelectorAll("[data-primary-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.primaryView === view);
  });

  if (view === "stats") {
    setText("#active-view-subtitle", "Official annual DS564 statistics, shown without a map because the source is city-level.");
    setText("#analytics-title", "Official Data Dashboard");
    setText("#feed-title-label", "Official Records");
  } else {
    setText("#active-view-subtitle", "Curated source-linked Milan news heatmap with inspectable URLs and processed location fields.");
    setText("#analytics-title", "News Heatmap Dashboard");
    setText("#feed-title-label", "Source-Linked Records");
    ensureMap();
    setTimeout(() => map?.invalidateSize(), 80);
    loadNewsDataIfNeeded();
  }

  populateControls();
  syncSearchInput();
  if (!options.skipRender) renderActiveView();
  if (!options.skipUrlSync) syncUrlState({ replace: true });
}

function populateControls() {
  if (activePrimaryView === "stats") {
    const types = getCrimeTypeTotals(officialRecords).sort((a, b) => b.count - a.count).map(row => row.type);
    officialFilters.category = setSelectOptions("filter-category", [
      { value: "all", text: "All Crime Types" },
      ...types.map(type => ({ value: type, text: type }))
    ], officialFilters.category);

    const years = getAvailableYears();
    officialFilters.year = setSelectOptions("filter-exact-month", [
      { value: "all", text: "All Years" },
      ...years.map(year => ({ value: String(year), text: String(year) }))
    ], officialFilters.year);

    setText("#filters-title", "Inspect Official Data");
    setText("#label-category", "Crime type");
    setText("#label-exact-month", "Official year");
    const searchInput = document.getElementById("feed-search");
    if (searchInput) searchInput.placeholder = "Search crime type, year, or count...";
  } else {
    newsFilters.category = setSelectOptions("filter-category", newsCategories.map(row => ({ value: row.value, text: row.label })), newsFilters.category);
    newsFilters.year = setSelectOptions("filter-exact-month", [
      { value: "all", text: "2026 + 2025 source records" },
      { value: "2026", text: "2026 source records" },
      { value: "2025", text: "2025 source records" }
    ], newsFilters.year);

    setText("#filters-title", "Filter News Heatmap");
    setText("#label-category", "News type");
    setText("#label-exact-month", "News period");
    const searchInput = document.getElementById("feed-search");
    if (searchInput) searchInput.placeholder = "Search news title, source, location...";
  }

  populateSourceLinks();
}

function setSelectOptions(id, options, selectedValue) {
  const select = document.getElementById(id);
  if (!select) return selectedValue;
  const fallback = options.some(option => option.value === selectedValue)
    ? selectedValue
    : (options[0] && options[0].value) || "all";
  select.innerHTML = "";
  options.forEach(option => {
    const element = document.createElement("option");
    element.value = option.value;
    element.textContent = option.text;
    select.appendChild(element);
  });
  select.value = fallback;
  return fallback;
}

function renderActiveView() {
  if (activePrimaryView === "news") {
    const filteredNews = getFilteredNewsRecords();
    renderNewsMap(filteredNews);
    renderNewsSummary(filteredNews);
    renderNewsFeed(filteredNews);
    populateNewsTicker(filteredNews);
    return;
  }

  const filteredOfficial = getFilteredOfficialRecords();
  renderStatsGrid(filteredOfficial);
  updateOfficialCharts(filteredOfficial);
  renderOfficialTable(filteredOfficial);
  updateOfficialSummary(filteredOfficial);
  renderOfficialFeed(filteredOfficial);
  populateNewsTicker([]);
}

function getFilteredOfficialRecords() {
  const query = searchQueries.stats.trim().toLowerCase();
  return officialRecords.filter(record => {
    const categoryMatch = officialFilters.category === "all" || record.type === officialFilters.category;
    const yearMatch = officialFilters.year === "all" || String(record.year) === String(officialFilters.year);
    const textMatch = !query || [record.type, record.year, record.count].join(" ").toLowerCase().includes(query);
    return categoryMatch && yearMatch && textMatch;
  });
}

function getFilteredNewsRecords() {
  const query = searchQueries.news.trim().toLowerCase();
  return newsRecords.filter(record => {
    const categoryMatch = newsFilters.category === "all" || record.category === newsFilters.category;
    const yearMatch = newsFilters.year === "all" || String(record.year) === String(newsFilters.year);
    const textMatch = !query || [
      record.title,
      record.source,
      record.domain,
      record.locationName,
      record.locationDetails,
      record.crimeCategory,
      record.legalStatus,
      record.shortSummary,
      record.categoryLabel,
      record.dateLabel
    ].join(" ").toLowerCase().includes(query);
    return categoryMatch && yearMatch && textMatch;
  });
}

function getAvailableYears() {
  return [...new Set(officialRecords.map(record => record.year))]
    .filter(Number.isFinite)
    .sort((a, b) => b - a);
}

function getCrimeTypeTotals(records) {
  const totals = new Map();
  records.filter(record => !record.isTotal).forEach(record => {
    totals.set(record.type, (totals.get(record.type) || 0) + record.count);
  });
  return [...totals.entries()].map(([type, count]) => ({ type, count }));
}

function getTopCrimeTypes(records, limit = 8) {
  return getCrimeTypeTotals(records)
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type, getLocale()))
    .slice(0, limit);
}

function getAnnualTotals(records) {
  const byYear = new Map();
  records.forEach(record => {
    if (!byYear.has(record.year)) byYear.set(record.year, { year: record.year, totalCandidates: [], categorySum: 0 });
    const bucket = byYear.get(record.year);
    if (record.isTotal) bucket.totalCandidates.push(record.count);
    else bucket.categorySum += record.count;
  });
  return [...byYear.values()]
    .map(bucket => ({ year: bucket.year, count: bucket.totalCandidates.length ? Math.max(...bucket.totalCandidates) : bucket.categorySum }))
    .sort((a, b) => a.year - b.year);
}

function getAggregateCount(records) {
  return getAnnualTotals(records).reduce((sum, row) => sum + row.count, 0);
}

function renderStatsGrid(records) {
  const grid = document.getElementById("stats-grid");
  if (!grid) return;

  if (officialLoadState.status === "error") {
    grid.innerHTML = `<div class="stat-card wide"><span>Official data error</span><strong>Unable to load DS564</strong><p>${escapeHtml(officialLoadState.error)}</p></div>`;
    return;
  }

  const allYears = getAvailableYears();
  const latestYear = allYears[0] || "n/a";
  const latestRecords = officialRecords.filter(record => record.year === latestYear);
  const latestTotal = getAggregateCount(latestRecords);
  const topType = getTopCrimeTypes(latestRecords, 1)[0];
  const selectedTotal = getAggregateCount(records);

  const cards = [
    ["Filtered records", formatNumber(records.length), `${formatNumber(officialRecords.length)} loaded official rows`],
    ["Filtered reported offences", formatNumber(selectedTotal), "Annual city-level aggregate count"],
    ["Latest official year", String(latestYear), `${formatNumber(latestTotal)} reported offences in latest loaded year`],
    ["Top latest type", topType ? topType.type : "n/a", topType ? formatNumber(topType.count) : "No type available"],
    ["Official fields", String(officialCrimeDataset.fields.length), officialCrimeDataset.fields.map(field => field.name).join(", ")],
    ["Unavailable dimensions", String(officialCrimeDataset.unavailableDimensions.length), officialCrimeDataset.unavailableDimensions.join(", ")]
  ];

  grid.innerHTML = cards.map(([label, value, note]) => `
    <div class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </div>
  `).join("");
}

function initCharts() {
  if (typeof Chart === "undefined") {
    chartsReady = false;
    return;
  }

  Chart.defaults.color = "#9ca3af";
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.font.size = 11;

  categoryChart = new Chart(document.getElementById("categoryChart").getContext("2d"), {
    type: "doughnut",
    data: { labels: [], datasets: [{ data: [], backgroundColor: ["#06b6d4", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#a855f7", "#14b8a6", "#f97316"], borderWidth: 1, borderColor: "#12151c" }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 9, padding: 10, font: { size: 10 } } } } }
  });

  annualChart = new Chart(document.getElementById("hourlyChart").getContext("2d"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Reported offences", data: [], backgroundColor: "rgba(6, 182, 212, 0.45)", borderColor: "#06b6d4", borderWidth: 1.5, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { callback: value => formatCompactNumber(value) } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
  });

  sourceChart = new Chart(document.getElementById("districtChart").getContext("2d"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Source fields", data: [], backgroundColor: [], borderRadius: 4 }] },
    options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, scales: { x: { beginAtZero: true, grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { precision: 0 } }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } }
  });

  chartsReady = true;
}

function updateOfficialCharts(records) {
  if (!chartsReady) return;

  const topTypes = getTopCrimeTypes(records, 8);
  categoryChart.data.labels = topTypes.map(row => row.type);
  categoryChart.data.datasets[0].data = topTypes.map(row => row.count);
  categoryChart.update();

  const annualRows = officialFilters.year === "all"
    ? getAnnualTotals(officialFilters.category === "all" ? officialRecords : officialRecords.filter(record => record.type === officialFilters.category))
    : getTopCrimeTypes(records, 10).map(row => ({ year: row.type, count: row.count }));
  annualChart.data.labels = annualRows.map(row => String(row.year));
  annualChart.data.datasets[0].data = annualRows.map(row => row.count);
  annualChart.update();

  sourceChart.data.labels = ["Official fields", "Unavailable dimensions", "Source links"];
  sourceChart.data.datasets[0].data = [
    officialCrimeDataset.fields.length,
    officialCrimeDataset.unavailableDimensions.length,
    officialDataSources.length
  ];
  sourceChart.data.datasets[0].backgroundColor = ["rgba(16, 185, 129, 0.72)", "rgba(245, 158, 11, 0.72)", "rgba(6, 182, 212, 0.72)"];
  sourceChart.update();
}

function renderOfficialTable(records) {
  const table = document.getElementById("stats-table");
  if (!table) return;
  const rows = [...records].sort((a, b) => b.year - a.year || b.count - a.count).slice(0, 80);
  table.innerHTML = `
    <table>
      <thead><tr><th>Year</th><th>Crime type</th><th>Count</th><th>Scope</th></tr></thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td>${escapeHtml(row.year)}</td>
            <td>${escapeHtml(row.type)}</td>
            <td>${escapeHtml(formatNumber(row.count))}</td>
            <td>${escapeHtml(officialCrimeDataset.granularity)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function updateOfficialSummary(records) {
  const summary = document.getElementById("data-source-summary");
  if (!summary) return;

  if (officialLoadState.status === "error") {
    summary.innerHTML = `
      <div><strong>Official data could not be loaded</strong></div>
      <div>${escapeHtml(officialLoadState.error)}</div>
      <div><a href="${getSafeExternalUrl(officialCrimeDataset.landingPage)}" target="_blank" rel="noopener noreferrer">Open DS564 source</a></div>
    `;
    return;
  }

  summary.innerHTML = `
    <div><strong>${escapeHtml(formatNumber(records.length))}</strong> filtered / ${escapeHtml(formatNumber(officialRecords.length))} official records</div>
    <div><strong>${escapeHtml(formatNumber(getAggregateCount(records)))}</strong> reported offences in active official filter</div>
    <div>Source: Comune di Milano DS564, ${escapeHtml(officialCrimeDataset.temporalCoverage)}</div>
    <div>Granularity: ${escapeHtml(officialCrimeDataset.granularity)}</div>
    <div>Unavailable: ${escapeHtml(officialCrimeDataset.unavailableDimensions.join(", "))}</div>
    <div><a href="${getSafeExternalUrl(officialCrimeDataset.apiUrl)}" target="_blank" rel="noopener noreferrer">CKAN API</a> / <a href="${getSafeExternalUrl(officialCrimeDataset.landingPage)}" target="_blank" rel="noopener noreferrer">DS564 landing page</a></div>
    <div>${escapeHtml(t("experimentalNotice", "Experimental visualization only. No legal, safety, travel, policing, insurance, or public-policy advice."))}</div>
  `;
}

function renderOfficialFeed(records) {
  const feed = document.getElementById("incident-feed-items");
  if (!feed) return;
  if (!records.length) {
    feed.innerHTML = '<div class="feed-empty-state">No official records match the active filters.</div>';
    return;
  }
  const rows = [...records].sort((a, b) => b.year - a.year || b.count - a.count).slice(0, 120);
  feed.innerHTML = rows.map(record => `
    <div class="feed-card">
      <div class="feed-card-header">
        <span class="feed-card-title">${escapeHtml(record.type)}</span>
        <span class="feed-card-time">${escapeHtml(record.year)}</span>
      </div>
      <p class="feed-card-desc">${escapeHtml(formatNumber(record.count))} reported offences / Comune di Milano</p>
      <div class="feed-card-meta">
        <span>Official aggregate record</span>
        <span>${escapeHtml(officialCrimeDataset.granularity)}</span>
      </div>
      <div class="feed-card-sources">
        <a href="${getSafeExternalUrl(officialCrimeDataset.landingPage)}" target="_blank" rel="noopener noreferrer">DS564</a>
        <a href="${getSafeExternalUrl(officialCrimeDataset.csvUrl)}" target="_blank" rel="noopener noreferrer">CSV</a>
      </div>
    </div>
  `).join("");
}

async function loadNewsDataIfNeeded() {
  if (newsLoadState.status === "loaded" || newsLoadState.status === "loading") return;
  newsLoadState = {
    ...newsLoadState,
    status: "loading",
    error: "",
    fetchedAt: null,
    method: newsHeatmapConfig.sourceName,
    received: { 2026: 0, 2025: 0 }
  };
  renderActiveView();

  try {
    const snapshot = window.milanNewsSnapshot;
    if (!snapshot || !Array.isArray(snapshot.items)) {
      throw new Error("Curated source-linked news snapshot is missing or invalid.");
    }
    newsRecords = snapshot.items
      .map((item, index) => normalizeSnapshotNewsItem(item, index))
      .filter(Boolean)
      .sort((a, b) => b.date - a.date || a.title.localeCompare(b.title, getLocale()));

    const received2026 = newsRecords.filter(item => item.year === 2026).length;
    const received2025 = newsRecords.filter(item => item.year === 2025).length;
    newsLoadState = {
      ...newsLoadState,
      status: "loaded",
      error: "",
      fetchedAt: snapshot.generatedAt ? new Date(snapshot.generatedAt) : new Date(),
      snapshot,
      received: {
        2026: received2026,
        2025: received2025
      }
    };
  } catch (error) {
    newsRecords = [];
    newsLoadState = {
      ...newsLoadState,
      status: "error",
      error: error.message || String(error),
      fetchedAt: null
    };
  }

  populateControls();
  renderActiveView();
}

function normalizeSnapshotNewsItem(item, index) {
  const title = cleanWhitespace(item.title || "");
  const url = cleanWhitespace(item.url || "");
  if (!title || !url) return null;

  const date = item.date
    ? new Date(`${item.date}T00:00:00Z`)
    : (parseGdeltDate(item.dateAdded) || new Date(`${item.year || 2026}-01-01T00:00:00Z`));
  const year = Number(item.year) || date.getUTCFullYear();
  const category = newsCategories.some(row => row.value === item.category) ? item.category : "other";
  const tier = item.dataTier || "curated-citywide-location";
  const confidence = item.confidence || "citywide-location-field";

  return {
    id: item.id || `snapshot-${index}-${slugify(title)}`,
    title,
    titleMethod: item.titleMethod || "source URL label",
    url,
    domain: item.domain || getArticleDomain(item, url),
    source: item.source || "",
    year,
    date,
    dateAdded: item.dateAdded || "",
    dateLabel: new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium" }).format(date),
    locationName: item.locationName || "Milano Citywide",
    locationDetails: item.locationDetails || "",
    locationScope: item.locationScope || "",
    lat: Number(item.lat) || 45.4642,
    lng: Number(item.lng) || 9.19,
    confidence,
    dataTier: tier,
    category,
    categoryLabel: newsCategories.find(row => row.value === category)?.label || "Other Safety News",
    crimeCategory: item.crimeCategory || "",
    legalStatus: item.legalStatus || "",
    peopleOrArrests: item.peopleOrArrests || "",
    shortSummary: item.shortSummary || "",
    incidentDate: item.incidentDate || "",
    retrievedDate: item.retrievedDate || "",
    notes: item.notes || "",
    sourceRowId: item.sourceRowId || item.id || "",
    weight: Number(item.weight) || (tier === "curated-specific-location" ? 0.92 : 0.52)
  };
}

function getArticleDomain(article, url) {
  const suppliedDomain = cleanWhitespace(article.domain || "");
  if (suppliedDomain) return suppliedDomain;
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown source";
  }
}

function parseGdeltDate(value) {
  const raw = String(value || "");
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return null;
  return new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] || 0),
    Number(match[5] || 0),
    Number(match[6] || 0)
  ));
}

function cleanWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureMap() {
  if (mapReady || typeof L === "undefined") return;
  map = L.map("map", { zoomControl: true, minZoom: 10, maxZoom: 16 }).setView([45.4642, 9.19], 12);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20
  }).addTo(map);
  newsHeatLayerGroup = L.layerGroup().addTo(map);
  newsMarkerLayerGroup = L.layerGroup().addTo(map);
  mapReady = true;
}

function renderNewsMap(records) {
  if (activePrimaryView !== "news") return;
  ensureMap();
  if (!mapReady || !map) return;

  newsHeatLayerGroup.clearLayers();
  newsMarkerLayerGroup.clearLayers();

  if (newsLoadState.status !== "loaded" || !records.length) return;

  const heatPoints = records.map(item => [item.lat, item.lng, item.weight]);
  if (activeMapLayerMode === "heatmap" && typeof L.heatLayer === "function") {
    newsHeatLayerGroup.addLayer(L.heatLayer(heatPoints, {
      radius: 26,
      blur: 18,
      maxZoom: 15,
      gradient: {
        0.2: "#10b981",
        0.55: "#f59e0b",
        0.95: "#ef4444"
      }
    }));
  }

  records.forEach(item => {
    const color = getNewsColor(item.category);
    const marker = L.circleMarker([item.lat, item.lng], {
      radius: activeMapLayerMode === "markerPins" ? 7 : 4,
      color,
      fillColor: color,
      fillOpacity: activeMapLayerMode === "markerPins" ? 0.78 : 0.5,
      weight: 1.5
    });
    marker.bindPopup(getNewsPopupHtml(item));
    newsMarkerLayerGroup.addLayer(marker);
  });
}

function getNewsColor(category) {
  return {
    robbery: "#a855f7",
    assault: "#ef4444",
    drugs: "#f59e0b",
    weapons: "#fb7185",
    publicOrder: "#06b6d4",
    fraud: "#3b82f6",
    other: "#10b981"
  }[category] || "#10b981";
}

function getNewsPopupHtml(item) {
  return `
    <div style="font-family: var(--font-main); min-width: 220px;">
      <h4 style="color:#fff; margin-bottom:6px;">${escapeHtml(item.locationName)}</h4>
      <p style="margin:0 0 8px; font-size:0.78rem; line-height:1.45;">${escapeHtml(item.title)}</p>
      <div style="display:grid; gap:4px; color:#9ca3af; font-size:0.72rem;">
        <span>${escapeHtml(item.dateLabel)} / ${escapeHtml(item.categoryLabel)}</span>
        <span>${escapeHtml(item.source || item.domain)} / row ${escapeHtml(item.sourceRowId || item.id)}</span>
        <span>Layer type: ${escapeHtml(formatNewsTier(item.dataTier))}</span>
        <span>Location processing: ${escapeHtml(item.confidence)}</span>
        ${item.legalStatus ? `<span>Legal status: ${escapeHtml(item.legalStatus)}</span>` : ""}
        <a href="${getSafeExternalUrl(item.url)}" target="_blank" rel="noopener noreferrer" style="color:#06b6d4;">Open source</a>
      </div>
    </div>
  `;
}

function renderNewsSummary(records) {
  const summary = document.getElementById("data-source-summary");
  if (!summary) return;

  if (newsLoadState.status === "idle") {
    summary.innerHTML = '<div>Open the News Heatmap view to load curated source-linked records.</div>';
    return;
  }

  if (newsLoadState.status === "loading") {
    summary.innerHTML = `
      <div><strong>Loading sourced news snapshot...</strong></div>
      <div>Reading the bundled CSV snapshot of source-linked Milan news records.</div>
    `;
    return;
  }

  if (newsLoadState.status === "error") {
    summary.innerHTML = `
      <div><strong>News snapshot error</strong></div>
      <div>${escapeHtml(newsLoadState.error)}</div>
      <div><a href="${getSafeExternalUrl(newsHeatmapConfig.csvUrl)}" target="_blank" rel="noopener noreferrer">Open source CSV</a></div>
    `;
    return;
  }

  const locationCounts = countBy(records, item => item.locationName);
  const topLocation = [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const tierCounts = countBy(records, item => formatNewsTier(item.dataTier));
  const specificTier = tierCounts.get("Specific CSV location") || 0;
  const snapshotDate = newsLoadState.fetchedAt && !Number.isNaN(newsLoadState.fetchedAt.getTime())
    ? new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium", timeStyle: "short" }).format(newsLoadState.fetchedAt)
    : "n/a";
  summary.innerHTML = `
    <div><strong>${escapeHtml(formatNumber(records.length))}</strong> filtered / ${escapeHtml(formatNumber(newsRecords.length))} source-linked records</div>
    <div>Loaded: ${escapeHtml(formatNumber(newsLoadState.received[2026]))} from 2026, ${escapeHtml(formatNumber(newsLoadState.received[2025]))} from 2025</div>
    <div>Source: ${escapeHtml(newsHeatmapConfig.sourceName)}, generated ${escapeHtml(snapshotDate)}.</div>
    <div>Rows with specific CSV location fields in active filter: ${escapeHtml(formatNumber(specificTier))}; citywide/province rows are lower-weight heat points.</div>
    <div>Geography: processed from CSV location_details/location_scope fields; not official incident coordinates.</div>
    <div>Top filtered location: ${escapeHtml(topLocation ? `${topLocation[0]} (${topLocation[1]})` : "n/a")}</div>
    <div><a href="${getSafeExternalUrl(newsHeatmapConfig.csvUrl)}" target="_blank" rel="noopener noreferrer">Open source CSV</a></div>
    <div>Experimental news layer only. Allegations and legal statuses are source-reported; not official crime statistics, not incident data, and not safety advice.</div>
  `;
}

function renderNewsFeed(records) {
  const feed = document.getElementById("incident-feed-items");
  if (!feed) return;

  if (newsLoadState.status === "loading") {
    feed.innerHTML = '<div class="feed-empty-state">Loading sourced news index results...</div>';
    return;
  }
  if (newsLoadState.status === "error") {
    feed.innerHTML = `<div class="feed-empty-state">News load failed. <a href="${getSafeExternalUrl(newsHeatmapConfig.csvUrl)}" target="_blank" rel="noopener noreferrer">Open source CSV</a></div>`;
    return;
  }
  if (!records.length) {
    feed.innerHTML = '<div class="feed-empty-state">No source-linked records match the active filters.</div>';
    return;
  }

  feed.innerHTML = records.map(item => `
    <div class="feed-card" data-news-id="${escapeHtml(item.id)}">
      <div class="feed-card-header">
        <span class="feed-card-title">${escapeHtml(item.locationName)}</span>
        <span class="feed-card-time">${escapeHtml(item.dateLabel)}</span>
      </div>
      <p class="feed-card-desc">${escapeHtml(item.title)}</p>
      <div class="feed-card-meta">
        <span>${escapeHtml(item.categoryLabel)}</span>
        <span>${escapeHtml(item.source || item.domain)}</span>
        ${item.peopleOrArrests ? `<span>${escapeHtml(item.peopleOrArrests)}</span>` : ""}
        <span>${escapeHtml(formatNewsTier(item.dataTier))}</span>
        <span>Location: ${escapeHtml(item.confidence)}</span>
      </div>
      <div class="feed-card-sources">
        <a href="${getSafeExternalUrl(item.url)}" target="_blank" rel="noopener noreferrer">Open source</a>
        <a href="${getSafeExternalUrl(newsHeatmapConfig.csvUrl)}" target="_blank" rel="noopener noreferrer">CSV row</a>
      </div>
    </div>
  `).join("");

  feed.querySelectorAll("[data-news-id]").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      const item = records.find(record => record.id === card.dataset.newsId);
      if (!item || !mapReady) return;
      setPrimaryView("news", { skipRender: true });
      map.setView([item.lat, item.lng], 14);
      L.popup().setLatLng([item.lat, item.lng]).setContent(getNewsPopupHtml(item)).openOn(map);
    });
  });
}

function populateNewsTicker(records) {
  const ticker = document.getElementById("news-ticker-scroll-content");
  if (!ticker) return;
  if (activePrimaryView !== "news") {
    ticker.textContent = "";
    return;
  }
  if (newsLoadState.status === "loading") {
    ticker.textContent = "Loading curated source-linked news snapshot...";
    return;
  }
  if (newsLoadState.status === "error") {
    ticker.textContent = `News load failed: ${newsLoadState.error}`;
    return;
  }
  const headlines = (records.length ? records : newsRecords)
    .slice(0, 12)
    .map(item => `${item.dateLabel}: ${item.domain} / ${item.locationName} / ${formatNewsTier(item.dataTier)}`)
    .join("  /  ");
  ticker.textContent = headlines || "No source-linked records loaded yet.";
}

function countBy(items, keyFn) {
  const counts = new Map();
  items.forEach(item => {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

function formatNewsTier(tier) {
  if (tier === "curated-specific-location") return "Specific CSV location";
  if (tier === "curated-metropolitan-location") return "Metro/province CSV location";
  if (tier === "curated-citywide-location") return "Citywide CSV location";
  return "Source-linked record";
}

function populateSourceLinks() {
  const sourceList = document.getElementById("source-link-list");
  if (!sourceList) return;

  const sources = activePrimaryView === "news"
    ? [
        { name: "Source CSV", url: newsHeatmapConfig.csvUrl },
        { name: "OpenStreetMap", url: "https://www.openstreetmap.org/copyright" },
        { name: "CARTO Basemap", url: "https://carto.com/attributions" }
      ]
    : [
        { name: "Comune Milano DS564", url: officialCrimeDataset.landingPage },
        { name: "CKAN Data API", url: officialCrimeDataset.apiUrl },
        { name: "Official CSV", url: officialCrimeDataset.csvUrl },
        { name: "Milano Statistica", url: "https://milanostatistica.comune.milano.it/" }
      ];

  sourceList.innerHTML = sources.map(source => `
    <a class="citation-badge source-link" href="${getSafeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>
  `).join("");
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat(getLocale()).format(number);
}

function formatCompactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat(getLocale(), { notation: "compact", maximumFractionDigits: 1 }).format(number);
}
