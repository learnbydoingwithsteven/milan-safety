// milan-safety/app.js

// Global variables for Map, Layers and Dashboard
let map;
let activeLanguage = 'en';
let activeViewMode = 'heatmap'; // 'heatmap', 'bubbleMap', 'choroplethMap', 'markerPins'
let activeFilters = {
  category: 'all',
  severity: 'all',
  hour: -1 // -1 means All Hours
};
let feedSearchQuery = '';
let activeTemporalView = 'hour';
let activeExactMonth = 'all';

// Layer groups for Leaflet overlays
let heatmapLayerGroup;
let bubbleLayerGroup;
let choroplethLayerGroup;
let markerLayerGroup;

// Chart references
let categoryChart;
let hourlyChart;
let districtChart;
let mapReady = false;
let chartsReady = false;

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  try {
    initLanguage();
    initMap();
    initCharts();
    populateSourceLinks();
    populateExactMonthOptions();
    setupEventListeners();
    populateNewsTicker();
    applyFiltersAndRender();
  } catch (error) {
    console.error('Milan Safety Map failed to initialize:', error);
    showMapFallback(
      'Unable to initialize the dashboard',
      'Check the browser console for details. The incident feed and controls will recover automatically once the data and libraries are available.'
    );
  }
});

// Initialize Language from local storage
function initLanguage() {
  const savedLang = localStorage.getItem('milan_safety_lang');
  if (savedLang && ['en', 'zh', 'it'].includes(savedLang)) {
    activeLanguage = savedLang;
  }
  updateLanguageUI();
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

function t(key, fallback) {
  return (translationDictionary[activeLanguage] && translationDictionary[activeLanguage][key])
    || translationDictionary.en[key]
    || fallback
    || key;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function getSafeExternalUrl(url) {
  try {
    const parsed = new URL(url, window.location.href);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
  } catch {
    return '#';
  }
}

// Update UI Text elements based on activeLanguage
function updateLanguageUI() {
  const dict = translationDictionary[activeLanguage] || translationDictionary.en;
  
  // Set browser title
  document.title = dict.appTitle;
  
  // Brand Header
  document.querySelector('.brand-title').textContent = dict.appTitle;
  document.querySelector('.brand-subtitle').textContent = dict.appSubtitle;
  
  // View mode section
  setInlineTitleText('#view-mode-title', dict.viewMode);
  document.querySelector('#btn-heatmap span').textContent = dict.heatmap;
  document.querySelector('#btn-bubble span').textContent = dict.bubbleMap;
  document.querySelector('#btn-choropleth span').textContent = dict.choroplethMap;
  document.querySelector('#btn-marker span').textContent = dict.markerPins;
  
  // Filters section
  setInlineTitleText('#filters-title', dict.filterTitle);
  document.querySelector('#label-category').textContent = dict.categoryLabel;
  document.querySelector('#label-severity').textContent = dict.severityLabel;
  document.querySelector('#label-time').textContent = dict.timeLabel;
  
  // Provenance metadata section
  setInlineTitleText('#provenance-title', dict.provenanceTitle);
  document.querySelector('#provenance-desc').textContent = dict.provenanceDesc;
  document.querySelector('#cites-label').textContent = dict.citesLabel;
  
  // Ticker title
  document.querySelector('#news-ticker-tag-text').textContent = dict.newsTickerTitle;
  
  // Right Panel Title Feed
  setInlineTitleText('#analytics-title', dict.analyticsTitle);
  setInlineTitleText('#feed-title-label', dict.feedTitle);
  document.querySelector('#feed-search').placeholder = dict.feedPlaceholder;
  setInlineTitleText('#data-view-title', t('dataViewTitle', 'Data View'));
  document.querySelector('#time-view-hour').textContent = t('byHour', 'Hour');
  document.querySelector('#time-view-day').textContent = t('byDayOfMonth', 'Day');
  document.querySelector('#time-view-month').textContent = t('byMonthOfYear', 'Month');
  document.querySelector('#time-view-exact').textContent = t('exactMonth', 'Exact Month');
  document.querySelector('#label-exact-month').textContent = t('exactMonthLabel', 'Exact month');
  
  // Category Select Options
  updateDropdownOptions('filter-category', [
    { value: 'all', text: dict.allCategories },
    { value: 'theft', text: dict.theft },
    { value: 'assault', text: dict.assault },
    { value: 'drugRelated', text: dict.drugRelated },
    { value: 'vandalism', text: dict.vandalism },
    { value: 'harassment', text: dict.harassment }
  ]);
  
  updateDropdownOptions('filter-severity', [
    { value: 'all', text: dict.allSeverities },
    { value: 'low', text: dict.low },
    { value: 'medium', text: dict.medium },
    { value: 'high', text: dict.high }
  ]);
  
  // Legend Panel
  document.querySelector('#legend-title-text').textContent = dict.legendTitle;
  document.querySelector('#legend-desc-low').textContent = dict.lowRiskDesc;
  document.querySelector('#legend-desc-med').textContent = dict.medRiskDesc;
  document.querySelector('#legend-desc-high').textContent = dict.highRiskDesc;
  
  // Highlight active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === activeLanguage);
  });
  
  // Update hour slider label readout
  updateHourSliderReadout();
  populateSourceLinks();
  populateExactMonthOptions();
  updateTemporalControlsUI();
}

// Update option elements in filter selects
function updateDropdownOptions(id, options) {
  const select = document.getElementById(id);
  const currentValue = select.value;
  select.innerHTML = '';
  options.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.text;
    select.appendChild(el);
  });
  select.value = currentValue;
  if (!select.value) select.value = 'all';
}

// Initialize Leaflet Map
function initMap() {
  if (typeof L === 'undefined') {
    mapReady = false;
    showMapFallback(
      'Interactive map assets did not load',
      'Leaflet is unavailable, so the page is showing a local incident summary instead of the live map.'
    );
    return;
  }

  const milanCoordinates = [45.474, 9.182];
  map = L.map('map', {
    zoomControl: true,
    minZoom: 11,
    maxZoom: 16
  }).setView(milanCoordinates, 12.5);

  // CartoDB Dark Matter tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Initialize Layer Groups
  heatmapLayerGroup = L.layerGroup().addTo(map);
  bubbleLayerGroup = L.layerGroup();
  choroplethLayerGroup = L.layerGroup();
  markerLayerGroup = L.layerGroup();
  mapReady = true;
}

// Initialize Chart.js Dashboards
function initCharts() {
  if (typeof Chart === 'undefined') {
    chartsReady = false;
    renderChartFallbacks(safetyIncidents);
    return;
  }

  const ctxCategory = document.getElementById('categoryChart').getContext('2d');
  const ctxHourly = document.getElementById('hourlyChart').getContext('2d');
  const ctxDistrict = document.getElementById('districtChart').getContext('2d');

  Chart.defaults.color = '#9ca3af';
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.font.size = 11;

  categoryChart = new Chart(ctxCategory, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#a855f7', '#ef4444', '#f59e0b', '#06b6d4', '#3b82f6'],
        borderWidth: 1,
        borderColor: '#12151c'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 9,
            padding: 10,
            font: { size: 10 }
          }
        }
      }
    }
  });

  hourlyChart = new Chart(ctxHourly, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: '',
        data: [],
        backgroundColor: 'rgba(6, 182, 212, 0.45)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
        x: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });

  districtChart = new Chart(ctxDistrict, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: '',
        data: [],
        backgroundColor: [],
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
        y: { grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });

  chartsReady = true;
}

// Primary Data Pipeline: filter data, re-draw map layers and metrics
function applyFiltersAndRender() {
  // 1. Filter incidents by category, severity, hour slider, and search details
  const filteredData = safetyIncidents.filter(incident => {
    const catMatch = activeFilters.category === 'all' || incident.category === activeFilters.category;
    const sevMatch = activeFilters.severity === 'all' || incident.severity === activeFilters.severity;
    const hourMatch = activeFilters.hour === -1 || getIncidentHour(incident) === activeFilters.hour;
    const monthMatch = activeTemporalView !== 'exactMonth'
      || activeExactMonth === 'all'
      || getIncidentMonthKey(incident) === activeExactMonth;
    
    // Fuzzy text search
    let textMatch = true;
    if (feedSearchQuery) {
      const detailsText = (incident.details[activeLanguage] || incident.details['en']).toLowerCase();
      textMatch = detailsText.includes(feedSearchQuery.toLowerCase());
    }

    return catMatch && sevMatch && hourMatch && monthMatch && textMatch;
  });

  // 2. Render Map layer
  renderMapLayer(filteredData);

  // 3. Update Charts
  updateChartsData(filteredData);

  // 4. Update Sidebar incident feed list
  updateIncidentFeedList(filteredData);

  // 5. Update data source and filter summary
  updateDataSourceSummary(filteredData);
}

function getIncidentHour(incident) {
  const hour = Number(incident.hour);
  if (!Number.isFinite(hour)) return 0;
  return ((Math.trunc(hour) % 24) + 24) % 24;
}

function formatIncidentHour(incident) {
  return `${String(getIncidentHour(incident)).padStart(2, '0')}:00`;
}

function getIncidentDate(incident) {
  const date = new Date(incident.timestamp);
  return Number.isNaN(date.getTime()) ? new Date('2026-06-01T00:00:00Z') : date;
}

function getIncidentDayOfMonth(incident) {
  return getIncidentDate(incident).getUTCDate();
}

function getIncidentMonthIndex(incident) {
  return getIncidentDate(incident).getUTCMonth();
}

function getIncidentMonthKey(incident) {
  const date = getIncidentDate(incident);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getAvailableMonthKeys() {
  return [...new Set(safetyIncidents.map(getIncidentMonthKey))].sort();
}

function formatMonthLabel(monthKey) {
  if (monthKey === 'all') return t('allMonths', 'All Months');
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(activeLanguage === 'it' ? 'it-IT' : activeLanguage === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function formatIncidentDate(incident) {
  const date = getIncidentDate(incident);
  return new Intl.DateTimeFormat(activeLanguage === 'it' ? 'it-IT' : activeLanguage === 'zh' ? 'zh-CN' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

// Render selected Map Layer style
function renderMapLayer(incidents) {
  if (!mapReady || !map) {
    renderStaticMapFallback(incidents);
    return;
  }

  // Clear all layers
  heatmapLayerGroup.clearLayers();
  bubbleLayerGroup.clearLayers();
  choroplethLayerGroup.clearLayers();
  markerLayerGroup.clearLayers();
  
  // Remove layer groups from map
  map.removeLayer(heatmapLayerGroup);
  map.removeLayer(bubbleLayerGroup);
  map.removeLayer(choroplethLayerGroup);
  map.removeLayer(markerLayerGroup);

  const dict = translationDictionary[activeLanguage] || translationDictionary.en;

  if (activeViewMode === 'heatmap') {
    const points = incidents.map(item => {
      let weight = 0.4;
      if (item.severity === 'medium') weight = 0.7;
      if (item.severity === 'high') weight = 1.0;
      return [item.lat, item.lng, weight];
    });

    if (typeof L.heatLayer === 'function') {
      const heatLayer = L.heatLayer(points, {
        radius: 25,
        blur: 18,
        maxZoom: 15,
        gradient: {
          0.2: '#10b981', // green
          0.5: '#f59e0b', // orange
          0.9: '#ef4444'  // red
        }
      });
      heatmapLayerGroup.addLayer(heatLayer);
    } else {
      incidents.forEach(item => {
        const color = item.severity === 'high' ? '#ef4444' : item.severity === 'medium' ? '#f59e0b' : '#10b981';
        heatmapLayerGroup.addLayer(L.circleMarker([item.lat, item.lng], {
          radius: item.severity === 'high' ? 9 : 6,
          color,
          fillColor: color,
          fillOpacity: 0.32,
          weight: 1
        }));
      });
    }
    heatmapLayerGroup.addTo(map);

  } else if (activeViewMode === 'bubbleMap') {
    const districtStats = {};
    milanDistricts.forEach(d => {
      districtStats[d.id] = { ...d, count: 0 };
    });

    incidents.forEach(item => {
      if (districtStats[item.district]) {
        districtStats[item.district].count++;
      }
    });

    Object.values(districtStats).forEach(district => {
      if (district.count === 0) return;

      const radius = Math.sqrt(district.count) * 85 + 40;
      let color = 'rgba(16, 185, 129, 0.4)';
      let border = '#10b981';
      
      if (district.baseRisk > 7.0) {
        color = 'rgba(239, 68, 68, 0.4)';
        border = '#ef4444';
      } else if (district.baseRisk > 4.5) {
        color = 'rgba(245, 158, 11, 0.4)';
        border = '#f59e0b';
      }

      const districtName = activeLanguage === 'zh' ? district.nameZh : activeLanguage === 'it' ? district.nameIt : district.nameEn;

      const bubble = L.circle([district.lat, district.lng], {
        color: border,
        fillColor: color,
        fillOpacity: 0.65,
        radius: radius,
        weight: 1.5
      });

      bubble.bindPopup(`
        <div style="font-family: var(--font-main); min-width: 140px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${escapeHtml(districtName)}</h4>
          <p style="margin: 0; font-size: 0.78rem;">
            ${dict.totalIncidents}: <strong>${district.count}</strong>
          </p>
          <div style="margin-top: 6px; font-size: 0.7rem; color: #9ca3af;">
            ${dict.districtRiskIndex}: ${district.baseRisk}
          </div>
        </div>
      `);

      bubbleLayerGroup.addLayer(bubble);
    });

    bubbleLayerGroup.addTo(map);

  } else if (activeViewMode === 'choroplethMap') {
    // Shading polygons for each district according to safety density
    const districtIncidentsCount = {};
    milanDistricts.forEach(d => {
      districtIncidentsCount[d.id] = 0;
    });

    incidents.forEach(item => {
      if (districtIncidentsCount[item.district] !== undefined) {
        districtIncidentsCount[item.district]++;
      }
    });

    milanDistricts.forEach(district => {
      const count = districtIncidentsCount[district.id];
      const coords = generateDistrictPolygonCoords(district.lat, district.lng, district.baseRisk);
      
      // Determine colors based on active incident volume
      let fillColor = '#10b981'; // Green
      if (count > 12) {
        fillColor = '#ef4444'; // Red
      } else if (count > 4) {
        fillColor = '#f59e0b'; // Orange
      }

      const districtName = activeLanguage === 'zh' ? district.nameZh : activeLanguage === 'it' ? district.nameIt : district.nameEn;

      const polygon = L.polygon(coords, {
        color: 'rgba(255, 255, 255, 0.15)',
        fillColor: fillColor,
        fillOpacity: 0.25,
        weight: 1.5,
        className: 'choropleth-poly'
      });

      polygon.bindPopup(`
        <div style="font-family: var(--font-main); min-width: 140px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${escapeHtml(districtName)}</h4>
          <p style="margin: 0; font-size: 0.78rem;">
            ${dict.totalIncidents}: <strong>${count}</strong>
          </p>
          <div style="margin-top: 6px; font-size: 0.7rem; color: #9ca3af;">
            ${dict.districtRiskIndex}: ${district.baseRisk}
          </div>
        </div>
      `);

      choroplethLayerGroup.addLayer(polygon);
    });

    choroplethLayerGroup.addTo(map);

  } else if (activeViewMode === 'markerPins') {
    incidents.forEach(item => {
      let pinColor = '#a855f7';
      if (item.category === 'assault') pinColor = '#ef4444';
      if (item.category === 'drugRelated') pinColor = '#f59e0b';
      if (item.category === 'vandalism') pinColor = '#06b6d4';
      if (item.category === 'harassment') pinColor = '#3b82f6';

      const customIcon = L.divIcon({
        className: 'glow-pin',
        html: `<div style="background-color: ${pinColor}; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 8px ${pinColor};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      const itemDesc = item.details[activeLanguage] || item.details['en'];
      const catText = dict[item.category] || item.category;

      marker.bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="color:#fff; margin-bottom:6px;">${escapeHtml(catText)}</h4>
          <p style="margin-bottom:8px; font-size:0.78rem; line-height:1.4;">${escapeHtml(itemDesc)}</p>
          <div class="popup-meta">
            <span class="meta-badge badge-${escapeHtml(item.category)}">${escapeHtml(catText)}</span>
            <span style="color:#9ca3af; font-size:0.7rem; align-self:center;">
              ${formatIncidentHour(item)}
            </span>
          </div>
        </div>
      `);

      markerLayerGroup.addLayer(marker);
      item.markerRef = marker; // save reference for card click linking
    });

    markerLayerGroup.addTo(map);
  }
}

// Update dashboard statistics charts
function updateChartsData(incidents) {
  if (!chartsReady || !categoryChart || !hourlyChart || !districtChart) {
    renderChartFallbacks(incidents);
    return;
  }

  const dict = translationDictionary[activeLanguage] || translationDictionary.en;

  // 1. Update Category Chart
  const categoryCounts = { theft: 0, assault: 0, drugRelated: 0, vandalism: 0, harassment: 0 };
  incidents.forEach(item => {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
  });

  categoryChart.data.labels = [dict.theft, dict.assault, dict.drugRelated, dict.vandalism, dict.harassment];
  categoryChart.data.datasets[0].data = [
    categoryCounts.theft,
    categoryCounts.assault,
    categoryCounts.drugRelated,
    categoryCounts.vandalism,
    categoryCounts.harassment
  ];
  categoryChart.update();

  // 2. Update time chart by the active temporal view
  const temporalSeries = getTemporalSeries(incidents);
  document.getElementById('chart-title-time').textContent = temporalSeries.title;
  hourlyChart.data.labels = temporalSeries.labels;
  hourlyChart.data.datasets[0].label = dict.totalIncidents;
  hourlyChart.data.datasets[0].data = temporalSeries.values;
  hourlyChart.update();

  // 3. Update District Index Chart
  const sortedDistricts = [...milanDistricts].sort((a, b) => b.baseRisk - a.baseRisk);
  
  districtChart.data.labels = sortedDistricts.map(d => {
    return activeLanguage === 'zh' ? d.nameZh : activeLanguage === 'it' ? d.nameIt : d.nameEn;
  });
  
  districtChart.data.datasets[0].label = dict.districtRiskIndex;
  districtChart.data.datasets[0].data = sortedDistricts.map(d => d.baseRisk);
  
  districtChart.data.datasets[0].backgroundColor = sortedDistricts.map(d => {
    if (d.baseRisk > 7.0) return 'rgba(239, 68, 68, 0.7)';
    if (d.baseRisk > 4.5) return 'rgba(245, 158, 11, 0.7)';
    return 'rgba(16, 185, 129, 0.7)';
  });
  
  districtChart.update();
}

function getTemporalSeries(incidents) {
  if (activeTemporalView === 'dayOfMonth') {
    const counts = Array(31).fill(0);
    incidents.forEach(item => {
      counts[getIncidentDayOfMonth(item) - 1]++;
    });

    return {
      title: 'Incident Volume by Day of Month',
      labels: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
      values: counts
    };
  }

  if (activeTemporalView === 'monthOfYear') {
    const counts = Array(12).fill(0);
    incidents.forEach(item => {
      counts[getIncidentMonthIndex(item)]++;
    });

    return {
      title: 'Incident Volume by Month of Year',
      labels: Array.from({ length: 12 }, (_, i) => formatMonthLabel(`2026-${String(i + 1).padStart(2, '0')}`).replace(' 2026', '')),
      values: counts
    };
  }

  if (activeTemporalView === 'exactMonth') {
    const monthKey = activeExactMonth === 'all' ? getAvailableMonthKeys()[0] : activeExactMonth;
    const [year, month] = monthKey.split('-').map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const counts = Array(daysInMonth).fill(0);

    incidents.forEach(item => {
      if (getIncidentMonthKey(item) === monthKey) {
        counts[getIncidentDayOfMonth(item) - 1]++;
      }
    });

    return {
      title: `Daily Incident Volume - ${formatMonthLabel(monthKey)}`,
      labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
      values: counts
    };
  }

  const counts = Array(24).fill(0);
  incidents.forEach(item => {
    counts[getIncidentHour(item)]++;
  });

  return {
    title: 'Hourly Incident Volume',
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    values: counts
  };
}

// Update the searchable incident list feed container
function updateIncidentFeedList(incidents) {
  const feedContainer = document.getElementById('incident-feed-items');
  feedContainer.innerHTML = '';

  const dict = translationDictionary[activeLanguage] || translationDictionary.en;

  if (incidents.length === 0) {
    const noDataDiv = document.createElement('div');
    noDataDiv.style.padding = '20px';
    noDataDiv.style.textAlign = 'center';
    noDataDiv.style.fontSize = '0.8rem';
    noDataDiv.style.color = 'var(--text-secondary)';
    noDataDiv.textContent = dict.noData;
    feedContainer.appendChild(noDataDiv);
    return;
  }

  // Sort by time (newest first)
  const sortedIncidents = [...incidents].sort((a, b) => b.id - a.id);

  sortedIncidents.forEach(item => {
    const card = document.createElement('div');
    card.className = 'feed-card';
    
    const catText = dict[item.category] || item.category;
    const descText = item.details[activeLanguage] || item.details['en'];
    const sourceLinks = getIncidentSources(item).slice(0, 2).map(source => (
      `<a href="${getSafeExternalUrl(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.name)}</a>`
    )).join('');

    card.innerHTML = `
      <div class="feed-card-header">
        <span class="feed-card-title">${escapeHtml(catText)}</span>
        <span class="feed-card-time">${formatIncidentHour(item)}</span>
      </div>
      <p class="feed-card-desc">${escapeHtml(descText)}</p>
      <div class="feed-card-meta">
        <span>${escapeHtml(formatIncidentDate(item))}</span>
        <span>${escapeHtml(t('sourceSynthetic', 'Synthetic incident row derived from official aggregate indicators'))}</span>
      </div>
      <div class="feed-card-sources">${sourceLinks}</div>
    `;

    card.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', event => event.stopPropagation());
    });

    // Interactive card click: pan map, zoom, and trigger popup
    card.addEventListener('click', () => {
      if (!mapReady || !map) return;
      map.setView([item.lat, item.lng], 15);
      
      // If marker mode is active, trigger the popup
      if (activeViewMode === 'markerPins' && item.markerRef) {
        item.markerRef.openPopup();
      } else {
        // Fallback popup if in heatmap or bubble view
        L.popup()
          .setLatLng([item.lat, item.lng])
          .setContent(`
            <div style="min-width: 160px; font-family: var(--font-main);">
              <h4 style="color:#fff; margin-bottom:4px;">${escapeHtml(catText)}</h4>
              <p style="margin: 0; font-size: 0.78rem;">${escapeHtml(descText)}</p>
            </div>
          `)
          .openOn(map);
      }
    });

    feedContainer.appendChild(card);
  });
}

// Populate the bottom news ticker marquee alerts
function populateNewsTicker() {
  const tickerContent = document.getElementById('news-ticker-scroll-content');
  tickerContent.innerHTML = '';
  
  // Combine news items with elegant separators
  const combinedAlerts = recentNewsAlerts.map(alert => alert[activeLanguage] || alert['en']).join('     •     ');
  tickerContent.textContent = combinedAlerts;
}

function populateSourceLinks() {
  const sourceList = document.getElementById('source-link-list');
  if (!sourceList || typeof officialDataSources === 'undefined') return;

  sourceList.innerHTML = '';
  officialDataSources.forEach(source => {
    const link = document.createElement('a');
    link.className = 'citation-badge source-link';
    link.href = getSafeExternalUrl(source.url);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = `${source.usedFor} - ${getSafeExternalUrl(source.url)}`;
    link.textContent = source.name.replace(' - Milano', '');
    sourceList.appendChild(link);
  });
}

function populateExactMonthOptions() {
  const select = document.getElementById('filter-exact-month');
  if (!select) return;

  const previousValue = activeExactMonth;
  const months = getAvailableMonthKeys();
  select.innerHTML = '';

  months.forEach(monthKey => {
    const option = document.createElement('option');
    option.value = monthKey;
    option.textContent = formatMonthLabel(monthKey);
    select.appendChild(option);
  });

  activeExactMonth = months.includes(previousValue) ? previousValue : (months[months.length - 1] || 'all');
  select.value = activeExactMonth;
}

function updateTemporalControlsUI() {
  document.querySelectorAll('[data-time-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.timeView === activeTemporalView);
  });

  const exactMonthGroup = document.querySelector('.exact-month-group');
  if (exactMonthGroup) {
    exactMonthGroup.classList.toggle('is-active', activeTemporalView === 'exactMonth');
  }
}

function updateDataSourceSummary(filteredData) {
  const summary = document.getElementById('data-source-summary');
  if (!summary) return;

  const sourceCount = typeof officialDataSources === 'undefined' ? 0 : officialDataSources.length;
  const monthLabel = activeTemporalView === 'exactMonth' && activeExactMonth !== 'all'
    ? formatMonthLabel(activeExactMonth)
    : t('allMonths', 'All Months');

  summary.innerHTML = `
    <div><strong>${filteredData.length}</strong> ${t('filteredRecordsLabel', 'filtered')} / ${safetyIncidents.length} ${t('dataRecordsLabel', 'records')}</div>
    <div><strong>${sourceCount}</strong> ${t('sourceLinksLabel', 'source links')} · ${monthLabel}</div>
  `;
}

function showMapFallback(title, message) {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  mapElement.classList.add('map-fallback');
  mapElement.innerHTML = `
    <div class="map-fallback-panel">
      <div class="map-fallback-kicker">Milan Safety Map</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderStaticMapFallback(incidents) {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  const districtCounts = {};
  milanDistricts.forEach(district => {
    districtCounts[district.id] = { ...district, count: 0 };
  });

  incidents.forEach(incident => {
    if (districtCounts[incident.district]) {
      districtCounts[incident.district].count++;
    }
  });

  const rows = Object.values(districtCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  mapElement.classList.add('map-fallback');
  mapElement.innerHTML = `
    <div class="map-fallback-panel map-fallback-wide">
      <div class="map-fallback-kicker">Local fallback view</div>
      <h2>Interactive map assets unavailable</h2>
      <p>The data layer is still loaded. Review the highest-volume districts below, or reload when Leaflet assets are available.</p>
      <div class="fallback-district-list">
        ${rows.map(row => `
          <div class="fallback-district-row">
            <span>${escapeHtml(getDistrictName(row))}</span>
            <strong>${row.count}</strong>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderChartFallbacks(incidents) {
  const dict = translationDictionary[activeLanguage] || translationDictionary.en;
  const categoryCounts = { theft: 0, assault: 0, drugRelated: 0, vandalism: 0, harassment: 0 };
  incidents.forEach(item => {
    if (categoryCounts[item.category] !== undefined) {
      categoryCounts[item.category]++;
    }
  });

  renderMiniBars(document.getElementById('categoryChart')?.parentElement, [
    [dict.theft, categoryCounts.theft, '#a855f7'],
    [dict.assault, categoryCounts.assault, '#ef4444'],
    [dict.drugRelated, categoryCounts.drugRelated, '#f59e0b'],
    [dict.vandalism, categoryCounts.vandalism, '#06b6d4'],
    [dict.harassment, categoryCounts.harassment, '#3b82f6']
  ]);

  const temporalSeries = getTemporalSeries(incidents);
  const temporalRows = temporalSeries.labels
    .map((label, index) => [label, temporalSeries.values[index], '#06b6d4'])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const temporalTitle = document.getElementById('chart-title-time');
  if (temporalTitle) temporalTitle.textContent = temporalSeries.title;
  renderMiniBars(document.getElementById('hourlyChart')?.parentElement, temporalRows);

  const districtRows = [...milanDistricts]
    .sort((a, b) => b.baseRisk - a.baseRisk)
    .slice(0, 8)
    .map(district => [
      getDistrictName(district),
      district.baseRisk,
      district.baseRisk > 7.0 ? '#ef4444' : district.baseRisk > 4.5 ? '#f59e0b' : '#10b981'
    ]);

  renderMiniBars(document.getElementById('districtChart')?.parentElement, districtRows);
}

function renderMiniBars(target, rows) {
  if (!target) return;

  const maxValue = Math.max(...rows.map(row => Number(row[1]) || 0), 1);
  target.innerHTML = '';
  target.classList.add('fallback-chart-wrapper');

  rows.forEach(([label, value, color]) => {
    const row = document.createElement('div');
    row.className = 'mini-bar-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'mini-bar-label';
    labelEl.textContent = label;

    const track = document.createElement('div');
    track.className = 'mini-bar-track';

    const fill = document.createElement('div');
    fill.className = 'mini-bar-fill';
    fill.style.width = `${Math.max((Number(value) || 0) / maxValue * 100, 4)}%`;
    fill.style.backgroundColor = color;
    track.appendChild(fill);

    const valueEl = document.createElement('strong');
    valueEl.className = 'mini-bar-value';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(track);
    row.appendChild(valueEl);
    target.appendChild(row);
  });
}

function getDistrictName(district) {
  if (activeLanguage === 'zh') return district.nameZh;
  if (activeLanguage === 'it') return district.nameIt;
  return district.nameEn;
}

function getSourceById(sourceId) {
  if (typeof officialDataSources === 'undefined') return null;
  return officialDataSources.find(source => source.id === sourceId) || null;
}

function getIncidentSources(incident) {
  const ids = incident.sourceIds || [];
  return ids.map(getSourceById).filter(Boolean);
}

// Helper to update the text labels near the hour slider dynamically
function updateHourSliderReadout() {
  const minReadout = document.getElementById('slider-min-readout');
  const maxReadout = document.getElementById('slider-max-readout');
  const hourVal = activeFilters.hour;
  
  if (hourVal === -1) {
    const dict = translationDictionary[activeLanguage] || translationDictionary.en;
    minReadout.textContent = dict.allTimes || 'All Hours';
    maxReadout.textContent = '';
  } else {
    minReadout.textContent = `${String(hourVal).padStart(2, '0')}:00`;
    maxReadout.textContent = `${String((hourVal + 1) % 24).padStart(2, '0')}:00`;
  }
}

// Connect listeners to buttons, slider, and text filters
function setupEventListeners() {
  // Language selectors
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeLanguage = e.target.dataset.lang;
      localStorage.setItem('milan_safety_lang', activeLanguage);
      updateLanguageUI();
      populateNewsTicker();
      applyFiltersAndRender();
    });
  });

  // Map view switcher buttons
  const mapBtns = {
    'btn-heatmap': 'heatmap',
    'btn-bubble': 'bubbleMap',
    'btn-choropleth': 'choroplethMap',
    'btn-marker': 'markerPins'
  };

  Object.entries(mapBtns).forEach(([btnId, mode]) => {
    document.getElementById(btnId).addEventListener('click', (e) => {
      Object.keys(mapBtns).forEach(id => {
        document.getElementById(id).classList.remove('active');
      });
      document.getElementById(btnId).classList.add('active');
      activeViewMode = mode;
      applyFiltersAndRender();
    });
  });

  document.querySelectorAll('[data-time-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTemporalView = btn.dataset.timeView;
      if (activeTemporalView === 'exactMonth' && activeExactMonth === 'all') {
        const availableMonths = getAvailableMonthKeys();
        activeExactMonth = availableMonths[availableMonths.length - 1] || 'all';
        const exactMonthSelect = document.getElementById('filter-exact-month');
        if (exactMonthSelect) exactMonthSelect.value = activeExactMonth;
      }
      updateTemporalControlsUI();
      applyFiltersAndRender();
    });
  });

  document.getElementById('filter-exact-month').addEventListener('change', (e) => {
    activeExactMonth = e.target.value;
    activeTemporalView = 'exactMonth';
    updateTemporalControlsUI();
    applyFiltersAndRender();
  });

  // Filter dropdown listeners
  document.getElementById('filter-category').addEventListener('change', (e) => {
    activeFilters.category = e.target.value;
    applyFiltersAndRender();
  });

  document.getElementById('filter-severity').addEventListener('change', (e) => {
    activeFilters.severity = e.target.value;
    applyFiltersAndRender();
  });

  // Hour slider change listener
  const hourSlider = document.getElementById('filter-hour');
  hourSlider.addEventListener('input', (e) => {
    activeFilters.hour = parseInt(e.target.value);
    updateHourSliderReadout();
    applyFiltersAndRender();
  });

  // Text search listener
  const searchInput = document.getElementById('feed-search');
  searchInput.addEventListener('input', (e) => {
    feedSearchQuery = e.target.value;
    applyFiltersAndRender();
  });
}
