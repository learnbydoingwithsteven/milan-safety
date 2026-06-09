// milan-safety/app.js

let map;
let activeLanguage = "en";
let activeViewMode = "heatmap";
let activeTemporalView = "exactMonth";
let activeFilters = {
  category: "all",
  year: "all"
};
let feedSearchQuery = "";

let officialRecords = [];
let officialLoadState = {
  status: "idle",
  error: "",
  fetchedAt: null,
  method: "",
  rawCount: 0
};

let heatmapLayerGroup;
let bubbleLayerGroup;
let choroplethLayerGroup;
let markerLayerGroup;

let categoryChart;
let hourlyChart;
let districtChart;
let mapReady = false;
let chartsReady = false;
let activeCityPopup = null;

const localeByLanguage = {
  en: "en-US",
  zh: "zh-CN",
  it: "it-IT"
};

document.addEventListener("DOMContentLoaded", () => {
  bootstrapOfficialDashboard().catch(error => {
    console.error("Milan Safety Map failed to initialize:", error);
    officialLoadState = {
      ...officialLoadState,
      status: "error",
      error: error.message || String(error)
    };
    showMapFallback(
      t("loadFailed", "Official data could not be loaded"),
      officialLoadState.error
    );
    updateDataSourceSummary([]);
    updateOfficialRecordList([]);
  });
});

async function bootstrapOfficialDashboard() {
  initLanguage();
  initMap();
  initCharts();
  setupEventListeners();
  updateLanguageUI();
  lockUnavailableControls();
  populateSourceLinks();
  populateNewsTicker();
  renderLoadingState();

  await loadOfficialCrimeData();

  populateFilterOptions();
  updateLanguageUI();
  applyFiltersAndRender();
}

function initLanguage() {
  const savedLang = localStorage.getItem("milan_safety_lang");
  if (savedLang && ["en", "zh", "it"].includes(savedLang)) {
    activeLanguage = savedLang;
  }
}

function t(key, fallback) {
  return (translationDictionary[activeLanguage] && translationDictionary[activeLanguage][key])
    || translationDictionary.en[key]
    || fallback
    || key;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function setInlineTitleText(selector, text) {
  const element = document.querySelector(selector);
  if (!element) return;

  const textNode = Array.from(element.childNodes).find(node => (
    node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0
  ));

  if (textNode) {
    textNode.nodeValue = ` ${text}`;
  } else {
    element.appendChild(document.createTextNode(` ${text}`));
  }
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

function updateLanguageUI() {
  document.title = t("appTitle", "Milan Safety Map");

  setText(".brand-title", t("appTitle", "Milan Safety Map"));
  setText(".brand-subtitle", t("appSubtitle", "Official annual data from Comune di Milano"));

  setInlineTitleText("#view-mode-title", t("viewMode", "Map Scope"));
  setText("#btn-heatmap span", t("heatmap", "City Total"));
  setText("#btn-bubble span", t("bubbleMap", "Source Scope"));
  setText("#btn-choropleth span", t("choroplethMap", "Data Coverage"));
  setText("#btn-marker span", t("markerPins", "No Incident Pins"));

  setInlineTitleText("#filters-title", t("filterTitle", "Inspect Official Data"));
  setText("#label-category", t("categoryLabel", "Crime type"));
  setText("#label-severity", t("severityLabel", "Granularity"));
  setText("#label-time", t("timeLabel", "Hour filter is not available in this source"));

  setInlineTitleText("#provenance-title", t("provenanceTitle", "Official Data Provenance"));
  setText("#provenance-desc", t("provenanceDesc", ""));
  setText("#cites-label", t("citesLabel", "Official Citations:"));
  setText("#news-ticker-tag-text", t("newsTickerTitle", "OFFICIAL DATA NOTICE"));

  setInlineTitleText("#analytics-title", t("analyticsTitle", "Official Data Dashboard"));
  setInlineTitleText("#feed-title-label", t("feedTitle", "Official Records"));
  const searchInput = document.getElementById("feed-search");
  if (searchInput) searchInput.placeholder = t("feedPlaceholder", "Search records...");

  setInlineTitleText("#data-view-title", t("dataViewTitle", "Data View"));
  setText("#time-view-hour", t("byHour", "Hour N/A"));
  setText("#time-view-day", t("byDayOfMonth", "Day N/A"));
  setText("#time-view-month", t("byMonthOfYear", "Month N/A"));
  setText("#time-view-exact", t("exactMonth", "Year"));
  setText("#label-exact-month", t("exactMonthLabel", "Official year"));

  setText("#legend-title-text", t("legendTitle", "Official Data Scope"));
  setText("#legend-desc-low", t("lowRiskDesc", "Annual aggregate"));
  setText("#legend-desc-med", t("medRiskDesc", "Counts by year and crime type"));
  setText("#legend-desc-high", t("highRiskDesc", "No incident coordinates"));

  setText("#chart-title-cat", t("crimeTypeTitle", "Crime Type Breakdown"));
  setText("#chart-title-time", t("annualTrendTitle", "Annual Trend"));
  setText("#chart-title-district", t("sourceScopeTitle", "Source Coverage and Fields"));

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === activeLanguage);
  });

  populateFilterOptions();
  populateSourceLinks();
  updateHourSliderReadout();
  updateTemporalControlsUI();
}

function lockUnavailableControls() {
  const severitySelect = document.getElementById("filter-severity");
  if (severitySelect) {
    setSelectOptions("filter-severity", [
      { value: "all", text: t("allSeverities", "Annual city aggregate") },
      { value: "street", text: t("low", "Street level not available") },
      { value: "hour", text: t("medium", "Hour level not available") },
      { value: "pin", text: t("high", "Incident pins not available") }
    ], "all");
    severitySelect.disabled = true;
    severitySelect.title = officialCrimeDataset.granularity;
  }

  const hourSlider = document.getElementById("filter-hour");
  if (hourSlider) {
    hourSlider.value = "-1";
    hourSlider.disabled = true;
    hourSlider.title = t("timeLabel", "Hour filter is not available in this source");
  }
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

function populateFilterOptions() {
  const crimeTypes = getCrimeTypeTotals(officialRecords)
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type, getLocale()))
    .map(row => row.type);

  activeFilters.category = setSelectOptions("filter-category", [
    { value: "all", text: t("allCategories", "All Crime Types") },
    ...crimeTypes.map(type => ({ value: type, text: type }))
  ], activeFilters.category);

  const years = getAvailableYears();
  activeFilters.year = setSelectOptions("filter-exact-month", [
    { value: "all", text: t("allMonths", "All Years") },
    ...years.map(year => ({ value: String(year), text: String(year) }))
  ], activeFilters.year);

  lockUnavailableControls();
}

function getLocale() {
  return localeByLanguage[activeLanguage] || "en-US";
}

function initMap() {
  if (typeof L === "undefined") {
    mapReady = false;
    showMapFallback(
      "Interactive map assets did not load",
      "Leaflet is unavailable, so only the official records and source links can be inspected."
    );
    return;
  }

  map = L.map("map", {
    zoomControl: true,
    minZoom: 10,
    maxZoom: 16
  }).setView([milanOfficialArea.lat, milanOfficialArea.lng], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
    subdomains: "abcd",
    maxZoom: 20
  }).addTo(map);

  heatmapLayerGroup = L.layerGroup().addTo(map);
  bubbleLayerGroup = L.layerGroup();
  choroplethLayerGroup = L.layerGroup();
  markerLayerGroup = L.layerGroup();
  mapReady = true;
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
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ["#06b6d4", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#a855f7", "#14b8a6", "#f97316"],
        borderWidth: 1,
        borderColor: "#12151c"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 9,
            padding: 10,
            font: { size: 10 }
          }
        },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${formatNumber(context.parsed)}`
          }
        }
      }
    }
  });

  hourlyChart = new Chart(document.getElementById("hourlyChart").getContext("2d"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: t("totalIncidents", "Reported offences"),
        data: [],
        backgroundColor: "rgba(6, 182, 212, 0.45)",
        borderColor: "#06b6d4",
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { callback: value => formatCompactNumber(value) }
        },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => `${t("totalIncidents", "Reported offences")}: ${formatNumber(context.parsed.y)}`
          }
        }
      }
    }
  });

  districtChart = new Chart(document.getElementById("districtChart").getContext("2d"), {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: t("sourceScopeTitle", "Source Coverage and Fields"),
        data: [],
        backgroundColor: [],
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { precision: 0 }
        },
        y: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${formatNumber(context.parsed.x)}`
          }
        }
      }
    }
  });

  chartsReady = true;
}

function renderLoadingState() {
  const feedContainer = document.getElementById("incident-feed-items");
  if (feedContainer) {
    feedContainer.innerHTML = "";
    const loading = document.createElement("div");
    loading.className = "feed-empty-state";
    loading.textContent = t("loadingData", "Loading official data...");
    feedContainer.appendChild(loading);
  }
  updateDataSourceSummary([]);
}

async function loadOfficialCrimeData() {
  officialLoadState = {
    status: "loading",
    error: "",
    fetchedAt: null,
    method: "",
    rawCount: 0
  };

  const attempts = [
    {
      label: "CKAN Data API fetch",
      run: () => fetchJson(officialCrimeDataset.apiUrl)
    },
    {
      label: "CKAN Data API JSONP",
      run: () => loadJsonp(officialCrimeDataset.apiUrl)
    },
    {
      label: "Official JSON file fetch",
      run: () => fetchJson(officialCrimeDataset.jsonUrl)
    },
    {
      label: "Official CSV file fetch",
      run: async () => parseDelimitedRows(await fetchText(officialCrimeDataset.csvUrl))
    }
  ];

  const errors = [];
  for (const attempt of attempts) {
    try {
      const payload = await attempt.run();
      const rows = Array.isArray(payload) && payload[0] && typeof payload[0] === "object"
        ? payload
        : extractRows(payload);
      const parsedRecords = normalizeOfficialRows(rows);
      if (!parsedRecords.length) {
        throw new Error("No parseable records found in official payload.");
      }

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

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

function loadJsonp(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
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

    const parsedUrl = new URL(url, window.location.href);
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

  if (payload.result && typeof payload.result === "object") {
    const resultArray = Object.values(payload.result).find(value => Array.isArray(value));
    if (Array.isArray(resultArray)) return resultArray;
  }

  const objectValues = Object.values(payload).filter(value => value && typeof value === "object");
  if (objectValues.length && objectValues.every(value => !Array.isArray(value))) {
    return objectValues;
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
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isWideFormatIgnoredField(field) {
  const normalized = normalizeFieldName(field);
  return [
    "id",
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
  const normalized = normalizeFieldName(type);
  return normalized.includes("totale");
}

function applyFiltersAndRender() {
  const filteredData = getFilteredRecords();
  renderMapLayer(filteredData);
  updateChartsData(filteredData);
  updateOfficialRecordList(filteredData);
  updateDataSourceSummary(filteredData);
}

function getFilteredRecords() {
  const query = feedSearchQuery.trim().toLowerCase();

  return officialRecords.filter(record => {
    const categoryMatch = activeFilters.category === "all" || record.type === activeFilters.category;
    const yearMatch = activeFilters.year === "all" || String(record.year) === String(activeFilters.year);
    const textMatch = !query || [
      record.type,
      record.year,
      record.count,
      officialCrimeDataset.publisher,
      officialCrimeDataset.id
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
    if (!byYear.has(record.year)) {
      byYear.set(record.year, { year: record.year, totalCandidates: [], categorySum: 0 });
    }

    const bucket = byYear.get(record.year);
    if (record.isTotal) {
      bucket.totalCandidates.push(record.count);
    } else {
      bucket.categorySum += record.count;
    }
  });

  return [...byYear.values()]
    .map(bucket => ({
      year: bucket.year,
      count: bucket.totalCandidates.length
        ? Math.max(...bucket.totalCandidates)
        : bucket.categorySum
    }))
    .sort((a, b) => a.year - b.year);
}

function getAggregateCount(records) {
  return getAnnualTotals(records).reduce((sum, row) => sum + row.count, 0);
}

function renderMapLayer(records) {
  if (officialLoadState.status === "error") {
    showMapFallback(t("loadFailed", "Official data could not be loaded"), officialLoadState.error);
    return;
  }

  if (!mapReady || !map) {
    renderStaticMapFallback(records);
    return;
  }

  [heatmapLayerGroup, bubbleLayerGroup, choroplethLayerGroup, markerLayerGroup].forEach(layer => {
    if (layer) layer.clearLayers();
  });

  [heatmapLayerGroup, bubbleLayerGroup, choroplethLayerGroup, markerLayerGroup].forEach(layer => {
    if (layer && map.hasLayer(layer)) map.removeLayer(layer);
  });

  const activeLayer = {
    heatmap: heatmapLayerGroup,
    bubbleMap: bubbleLayerGroup,
    choroplethMap: choroplethLayerGroup,
    markerPins: markerLayerGroup
  }[activeViewMode] || heatmapLayerGroup;

  const total = getAggregateCount(records);
  const hasRecords = records.length > 0;
  const radius = hasRecords ? Math.max(900, Math.min(6200, Math.sqrt(Math.max(total, 1)) * 9)) : 900;
  const center = [milanOfficialArea.lat, milanOfficialArea.lng];

  const colorByMode = {
    heatmap: "#06b6d4",
    bubbleMap: "#10b981",
    choroplethMap: "#f59e0b",
    markerPins: "#ef4444"
  };
  const color = colorByMode[activeViewMode] || "#06b6d4";

  const cityCircle = L.circle(center, {
    color,
    fillColor: color,
    fillOpacity: activeViewMode === "markerPins" ? 0.12 : 0.26,
    radius,
    weight: 2
  });
  cityCircle.bindPopup(getCityPopupHtml(records));
  activeLayer.addLayer(cityCircle);

  const cityMarker = L.circleMarker(center, {
    radius: activeViewMode === "markerPins" ? 8 : 5,
    color: "#ffffff",
    fillColor: color,
    fillOpacity: 0.85,
    weight: 1.5
  });
  cityMarker.bindPopup(getCityPopupHtml(records));
  activeLayer.addLayer(cityMarker);

  activeLayer.addTo(map);
}

function getCityPopupHtml(records) {
  const count = getAggregateCount(records);
  const yearLabel = activeFilters.year === "all" ? t("allMonths", "All Years") : activeFilters.year;
  const categoryLabel = activeFilters.category === "all" ? t("allCategories", "All Crime Types") : activeFilters.category;
  const sourceUrl = getSafeExternalUrl(officialCrimeDataset.landingPage);

  return `
    <div style="font-family: var(--font-main); min-width: 210px;">
      <h4 style="color: #fff; margin-bottom: 6px;">${escapeHtml(getOfficialAreaName())}</h4>
      <p style="margin: 0 0 8px; font-size: 0.78rem; line-height: 1.45;">
        ${escapeHtml(t("totalIncidents", "Reported offences"))}: <strong>${escapeHtml(formatNumber(count))}</strong>
      </p>
      <div style="display: grid; gap: 4px; font-size: 0.72rem; color: #9ca3af;">
        <span>${escapeHtml(t("yearLabel", "Year"))}: ${escapeHtml(yearLabel)}</span>
        <span>${escapeHtml(t("categoryLabel", "Crime type"))}: ${escapeHtml(categoryLabel)}</span>
        <span>${escapeHtml(t("scopeLabel", "Scope"))}: ${escapeHtml(officialCrimeDataset.granularity)}</span>
        <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#06b6d4;">${escapeHtml(t("sourceOpen", "Open source"))}</a>
      </div>
    </div>
  `;
}

function getOfficialAreaName() {
  if (activeLanguage === "zh") return milanOfficialArea.nameZh;
  if (activeLanguage === "it") return milanOfficialArea.nameIt;
  return milanOfficialArea.nameEn;
}

function updateChartsData(records) {
  if (!chartsReady || !categoryChart || !hourlyChart || !districtChart) {
    renderChartFallbacks(records);
    return;
  }

  const topTypes = getTopCrimeTypes(records, 8);
  categoryChart.data.labels = topTypes.map(row => row.type);
  categoryChart.data.datasets[0].data = topTypes.map(row => row.count);
  categoryChart.update();

  updateTemporalChart(records);
  updateSourceCoverageChart();
}

function updateTemporalChart(records) {
  const unavailableViews = {
    hour: "hour",
    dayOfMonth: "day of month",
    monthOfYear: "month of year"
  };

  if (unavailableViews[activeTemporalView]) {
    setText("#chart-title-time", `${t("unavailableChartTitle", "Requested Time Dimension Not In Source")}: ${unavailableViews[activeTemporalView]}`);
    hourlyChart.data.labels = [];
    hourlyChart.data.datasets[0].label = t("unavailableLabel", "Unavailable in source");
    hourlyChart.data.datasets[0].data = [];
    hourlyChart.update();
    return;
  }

  const selectedYear = activeFilters.year === "all" ? null : Number(activeFilters.year);
  if (selectedYear) {
    const yearRecords = records.filter(record => record.year === selectedYear);
    const yearRows = getTopCrimeTypes(yearRecords, 10);
    setText("#chart-title-time", `${t("exactYearTitle", "Selected Year Breakdown")} ${selectedYear}`);
    hourlyChart.data.labels = yearRows.map(row => row.type);
    hourlyChart.data.datasets[0].label = t("totalIncidents", "Reported offences");
    hourlyChart.data.datasets[0].data = yearRows.map(row => row.count);
    hourlyChart.update();
    return;
  }

  const trendBase = activeFilters.category === "all"
    ? officialRecords.filter(record => matchesSearch(record))
    : officialRecords.filter(record => record.type === activeFilters.category && matchesSearch(record));
  const annualRows = getAnnualTotals(trendBase);
  setText("#chart-title-time", t("annualTrendTitle", "Annual Trend"));
  hourlyChart.data.labels = annualRows.map(row => String(row.year));
  hourlyChart.data.datasets[0].label = t("totalIncidents", "Reported offences");
  hourlyChart.data.datasets[0].data = annualRows.map(row => row.count);
  hourlyChart.update();
}

function matchesSearch(record) {
  const query = feedSearchQuery.trim().toLowerCase();
  if (!query) return true;
  return [record.type, record.year, record.count].join(" ").toLowerCase().includes(query);
}

function updateSourceCoverageChart() {
  setText("#chart-title-district", t("sourceScopeTitle", "Source Coverage and Fields"));
  districtChart.data.labels = [
    t("fieldLabel", "Official fields"),
    t("unavailableLabel", "Unavailable in source"),
    t("sourceLinksLabel", "source links")
  ];
  districtChart.data.datasets[0].data = [
    officialCrimeDataset.fields.length,
    officialCrimeDataset.unavailableDimensions.length,
    officialDataSources.length
  ];
  districtChart.data.datasets[0].backgroundColor = [
    "rgba(16, 185, 129, 0.72)",
    "rgba(245, 158, 11, 0.72)",
    "rgba(6, 182, 212, 0.72)"
  ];
  districtChart.update();
}

function updateOfficialRecordList(records) {
  const feedContainer = document.getElementById("incident-feed-items");
  if (!feedContainer) return;

  feedContainer.innerHTML = "";

  if (officialLoadState.status === "loading") {
    const loading = document.createElement("div");
    loading.className = "feed-empty-state";
    loading.textContent = t("loadingData", "Loading official data...");
    feedContainer.appendChild(loading);
    return;
  }

  if (officialLoadState.status === "error") {
    feedContainer.appendChild(buildSourceErrorElement());
    return;
  }

  if (!records.length) {
    const noDataDiv = document.createElement("div");
    noDataDiv.className = "feed-empty-state";
    noDataDiv.textContent = t("noData", "No official records match the active filters.");
    feedContainer.appendChild(noDataDiv);
    return;
  }

  const sortedRecords = [...records].sort((a, b) => (
    b.year - a.year
    || b.count - a.count
    || a.type.localeCompare(b.type, getLocale())
  ));

  sortedRecords.slice(0, 150).forEach(record => {
    const card = document.createElement("div");
    card.className = "feed-card";

    const sourceLinks = getRecordSources(record).slice(0, 3).map(source => (
      `<a href="${getSafeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`
    )).join("");

    card.innerHTML = `
      <div class="feed-card-header">
        <span class="feed-card-title">${escapeHtml(record.type)}</span>
        <span class="feed-card-time">${escapeHtml(String(record.year))}</span>
      </div>
      <p class="feed-card-desc">
        ${escapeHtml(formatNumber(record.count))} ${escapeHtml(t("totalIncidents", "reported offences"))}
        / ${escapeHtml(getOfficialAreaName())}
      </p>
      <div class="feed-card-meta">
        <span>${escapeHtml(t("sourceRecord", "Official aggregate record"))}</span>
        <span>${escapeHtml(t("countLabel", "Count"))}: ${escapeHtml(formatNumber(record.count))}</span>
        <span>${escapeHtml(officialCrimeDataset.granularity)}</span>
      </div>
      <div class="feed-card-sources">${sourceLinks}</div>
    `;

    card.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", event => event.stopPropagation());
    });

    card.addEventListener("click", () => {
      if (!mapReady || !map || typeof L === "undefined") return;
      map.setView([milanOfficialArea.lat, milanOfficialArea.lng], 12);
      if (activeCityPopup) activeCityPopup.remove();
      activeCityPopup = L.popup()
        .setLatLng([milanOfficialArea.lat, milanOfficialArea.lng])
        .setContent(`
          <div style="font-family: var(--font-main); min-width: 180px;">
            <h4 style="color:#fff; margin-bottom:6px;">${escapeHtml(record.type)}</h4>
            <p style="margin:0; font-size:0.78rem;">${escapeHtml(record.year)}: ${escapeHtml(formatNumber(record.count))}</p>
          </div>
        `)
        .openOn(map);
    });

    feedContainer.appendChild(card);
  });

  if (sortedRecords.length > 150) {
    const footer = document.createElement("div");
    footer.className = "feed-empty-state";
    footer.textContent = `${formatNumber(sortedRecords.length - 150)} more official records match; narrow the filter or search.`;
    feedContainer.appendChild(footer);
  }
}

function buildSourceErrorElement() {
  const wrapper = document.createElement("div");
  wrapper.className = "feed-empty-state";

  const message = document.createElement("p");
  message.textContent = `${t("loadFailed", "Official data could not be loaded")}.`;
  wrapper.appendChild(message);

  const link = document.createElement("a");
  link.href = getSafeExternalUrl(officialCrimeDataset.landingPage);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = t("retrySource", "Open the official source URL");
  wrapper.appendChild(link);

  return wrapper;
}

function populateNewsTicker() {
  const tickerContent = document.getElementById("news-ticker-scroll-content");
  if (!tickerContent) return;

  const combinedAlerts = recentNewsAlerts
    .map(alert => alert[activeLanguage] || alert.en)
    .join("  /  ");
  tickerContent.textContent = combinedAlerts;
}

function populateSourceLinks() {
  const sourceList = document.getElementById("source-link-list");
  if (!sourceList || typeof officialDataSources === "undefined") return;

  sourceList.innerHTML = "";
  officialDataSources.forEach(source => {
    const link = document.createElement("a");
    link.className = "citation-badge source-link";
    link.href = getSafeExternalUrl(source.url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = `${source.usedFor} - ${getSafeExternalUrl(source.url)}`;
    link.textContent = source.name;
    sourceList.appendChild(link);
  });
}

function updateTemporalControlsUI() {
  document.querySelectorAll("[data-time-view]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.timeView === activeTemporalView);
    btn.classList.toggle("unavailable", ["hour", "dayOfMonth", "monthOfYear"].includes(btn.dataset.timeView));
  });

  const exactMonthGroup = document.querySelector(".exact-month-group");
  if (exactMonthGroup) {
    exactMonthGroup.classList.toggle("is-active", activeTemporalView === "exactMonth");
  }
}

function updateDataSourceSummary(records) {
  const summary = document.getElementById("data-source-summary");
  if (!summary) return;

  if (officialLoadState.status === "loading") {
    summary.textContent = t("loadingData", "Loading official data...");
    return;
  }

  if (officialLoadState.status === "error") {
    summary.innerHTML = `
      <div><strong>${escapeHtml(t("loadFailed", "Official data could not be loaded"))}</strong></div>
      <div>${escapeHtml(officialLoadState.error)}</div>
      <div><a href="${getSafeExternalUrl(officialCrimeDataset.landingPage)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("retrySource", "Open the official source URL"))}</a></div>
    `;
    return;
  }

  const yearLabel = activeFilters.year === "all" ? t("allMonths", "All Years") : activeFilters.year;
  const categoryLabel = activeFilters.category === "all" ? t("allCategories", "All Crime Types") : activeFilters.category;
  const unavailable = officialCrimeDataset.unavailableDimensions.join(", ");
  const fetchedAt = officialLoadState.fetchedAt
    ? new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium", timeStyle: "short" }).format(officialLoadState.fetchedAt)
    : officialCrimeDataset.lastUpdated;

  summary.innerHTML = `
    <div><strong>${escapeHtml(formatNumber(records.length))}</strong> ${escapeHtml(t("filteredRecordsLabel", "filtered"))} / ${escapeHtml(formatNumber(officialRecords.length))} ${escapeHtml(t("dataRecordsLabel", "records"))}</div>
    <div><strong>${escapeHtml(formatNumber(getAggregateCount(records)))}</strong> ${escapeHtml(t("totalIncidents", "Reported offences"))} / ${escapeHtml(yearLabel)}</div>
    <div>${escapeHtml(t("categoryLabel", "Crime type"))}: <strong>${escapeHtml(categoryLabel)}</strong></div>
    <div>${escapeHtml(t("scopeLabel", "Scope"))}: ${escapeHtml(officialCrimeDataset.granularity)}</div>
    <div>${escapeHtml(t("fieldLabel", "Official fields"))}: ${officialCrimeDataset.fields.map(field => escapeHtml(field.name)).join(", ")}</div>
    <div>${escapeHtml(t("unavailableLabel", "Unavailable in source"))}: ${escapeHtml(unavailable)}</div>
    <div>${escapeHtml(t("sourceMethod", "Source method"))}: ${escapeHtml(officialLoadState.method || "Official source")}</div>
    <div>${escapeHtml(t("updatedLabel", "Updated"))}: ${escapeHtml(fetchedAt)}</div>
    <div><a href="${getSafeExternalUrl(officialCrimeDataset.apiUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("urlLabel", "URL"))}: CKAN API</a></div>
    <div><a href="${getSafeExternalUrl(officialCrimeDataset.landingPage)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("sourceOpen", "Open source"))}: DS564</a></div>
    <div>${escapeHtml(t("experimentalNotice", "Experimental visualization only."))}</div>
  `;
}

function showMapFallback(title, message) {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  mapElement.classList.add("map-fallback");
  mapElement.innerHTML = `
    <div class="map-fallback-panel">
      <div class="map-fallback-kicker">Milan Safety Map</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
      <a href="${getSafeExternalUrl(officialCrimeDataset.landingPage)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("retrySource", "Open the official source URL"))}</a>
    </div>
  `;
}

function renderStaticMapFallback(records) {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  const topTypes = getTopCrimeTypes(records, 6);
  mapElement.classList.add("map-fallback");
  mapElement.innerHTML = `
    <div class="map-fallback-panel map-fallback-wide">
      <div class="map-fallback-kicker">${escapeHtml(t("scopeLabel", "Scope"))}</div>
      <h2>${escapeHtml(getOfficialAreaName())}</h2>
      <p>${escapeHtml(officialCrimeDataset.granularity)}</p>
      <div class="fallback-district-list">
        ${topTypes.map(row => `
          <div class="fallback-district-row">
            <span>${escapeHtml(row.type)}</span>
            <strong>${escapeHtml(formatNumber(row.count))}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderChartFallbacks(records) {
  const topTypes = getTopCrimeTypes(records, 6).map(row => [row.type, row.count, "#06b6d4"]);
  renderMiniBars(document.getElementById("categoryChart")?.parentElement, topTypes);

  const annualRows = getAnnualTotals(records).map(row => [String(row.year), row.count, "#10b981"]);
  renderMiniBars(document.getElementById("hourlyChart")?.parentElement, annualRows);

  renderMiniBars(document.getElementById("districtChart")?.parentElement, [
    [t("fieldLabel", "Official fields"), officialCrimeDataset.fields.length, "#10b981"],
    [t("unavailableLabel", "Unavailable in source"), officialCrimeDataset.unavailableDimensions.length, "#f59e0b"],
    [t("sourceLinksLabel", "source links"), officialDataSources.length, "#06b6d4"]
  ]);
}

function renderMiniBars(target, rows) {
  if (!target) return;

  const safeRows = rows.length ? rows : [[t("noData", "No data"), 0, "#6b7280"]];
  const maxValue = Math.max(...safeRows.map(row => Number(row[1]) || 0), 1);
  target.innerHTML = "";
  target.classList.add("fallback-chart-wrapper");

  safeRows.forEach(([label, value, color]) => {
    const row = document.createElement("div");
    row.className = "mini-bar-row";

    const labelEl = document.createElement("span");
    labelEl.className = "mini-bar-label";
    labelEl.textContent = label;

    const track = document.createElement("div");
    track.className = "mini-bar-track";

    const fill = document.createElement("div");
    fill.className = "mini-bar-fill";
    fill.style.width = `${Math.max((Number(value) || 0) / maxValue * 100, value > 0 ? 4 : 0)}%`;
    fill.style.backgroundColor = color;
    track.appendChild(fill);

    const valueEl = document.createElement("strong");
    valueEl.className = "mini-bar-value";
    valueEl.textContent = formatNumber(value);

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(valueEl);
    target.appendChild(row);
  });
}

function getSourceById(sourceId) {
  if (typeof officialDataSources === "undefined") return null;
  return officialDataSources.find(source => source.id === sourceId) || null;
}

function getRecordSources(record) {
  const ids = record.sourceIds || [];
  return ids.map(getSourceById).filter(Boolean);
}

function updateHourSliderReadout() {
  const minReadout = document.getElementById("slider-min-readout");
  const maxReadout = document.getElementById("slider-max-readout");
  if (minReadout) minReadout.textContent = t("allTimes", "No hour field");
  if (maxReadout) maxReadout.textContent = "";
}

function setupEventListeners() {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeLanguage = btn.dataset.lang;
      localStorage.setItem("milan_safety_lang", activeLanguage);
      updateLanguageUI();
      populateNewsTicker();
      applyFiltersAndRender();
    });
  });

  const mapBtns = {
    "btn-heatmap": "heatmap",
    "btn-bubble": "bubbleMap",
    "btn-choropleth": "choroplethMap",
    "btn-marker": "markerPins"
  };

  Object.entries(mapBtns).forEach(([btnId, mode]) => {
    const button = document.getElementById(btnId);
    if (!button) return;

    button.addEventListener("click", () => {
      Object.keys(mapBtns).forEach(id => {
        const otherButton = document.getElementById(id);
        if (otherButton) otherButton.classList.remove("active");
      });
      button.classList.add("active");
      activeViewMode = mode;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll("[data-time-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTemporalView = btn.dataset.timeView;
      updateTemporalControlsUI();
      applyFiltersAndRender();
    });
  });

  const yearSelect = document.getElementById("filter-exact-month");
  if (yearSelect) {
    yearSelect.addEventListener("change", event => {
      activeFilters.year = event.target.value;
      activeTemporalView = "exactMonth";
      updateTemporalControlsUI();
      applyFiltersAndRender();
    });
  }

  const categorySelect = document.getElementById("filter-category");
  if (categorySelect) {
    categorySelect.addEventListener("change", event => {
      activeFilters.category = event.target.value;
      applyFiltersAndRender();
    });
  }

  const hourSlider = document.getElementById("filter-hour");
  if (hourSlider) {
    hourSlider.addEventListener("input", () => {
      hourSlider.value = "-1";
      updateHourSliderReadout();
    });
  }

  const searchInput = document.getElementById("feed-search");
  if (searchInput) {
    searchInput.addEventListener("input", event => {
      feedSearchQuery = event.target.value;
      applyFiltersAndRender();
    });
  }
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat(getLocale()).format(number);
}

function formatCompactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return new Intl.NumberFormat(getLocale(), {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}
