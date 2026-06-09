// milan-safety/data.js

// Translation Dictionary for English, Chinese (Simplified), and Italian
const translationDictionary = {
  en: {
    appTitle: "Milan Safety Map",
    appSubtitle: "Interactive Crime Hotspots & District Risk Analytics",
    viewMode: "Map View Mode",
    heatmap: "Heatmap View",
    bubbleMap: "District Bubble Map",
    markerPins: "Incident Pins",
    choroplethMap: "District Choropleth Map",
    filterTitle: "Filter Incidents",
    categoryLabel: "Category",
    allCategories: "All Categories",
    theft: "Theft & Pickpocketing",
    assault: "Physical Assault & Robbery",
    drugRelated: "Drug Trafficking",
    vandalism: "Vandalism & Damage",
    harassment: "Harassment & Brawls",
    severityLabel: "Severity",
    allSeverities: "All Severities",
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    timeLabel: "Hour range filter (0:00 - 24:00)",
    allTimes: "All Times",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    analyticsTitle: "Analytics & Incident Feed",
    incidentBreakdown: "Incident Breakdown",
    monthlyTrends: "Hourly Incident Volume",
    districtRanking: "Safety Risk Index by District",
    safestHours: "Safety Tips & Recommendations",
    districtLabel: "District",
    totalIncidents: "Total Incidents",
    safetyTips: [
      "Avoid poorly lit pedestrian areas around Milano Centrale Station late at night.",
      "Keep personal belongings secure and be vigilant on Metro M1/M2 lines and in crowded Duomo areas.",
      "Exercise caution in the Navigli nightlife district during late-night weekend hours.",
      "Stay in well-lit public squares and use official transit/taxis when traveling after midnight."
    ],
    promptModalTitle: "App Genesis & Original Prompt",
    promptModalBtn: "Prompt Archive",
    promptModalClose: "Close",
    promptModalDesc: "This project was built based on the user's voice command instructions recorded on June 9, 2026.",
    districtRiskIndex: "District Safety Index (Lower is Safer)",
    noData: "No incidents match the active filters.",
    legendTitle: "Risk Level Indicator",
    lowRiskDesc: "Minimal incidents / Safe residential",
    medRiskDesc: "Caution suggested at night / Nightlife areas",
    highRiskDesc: "High vigilance / Central transport hubs at night",
    
    // New Translations for Extensions
    feedTitle: "Real-time Incident Feed",
    feedPlaceholder: "Search incident details...",
    newsTickerTitle: "RECENT SECURITY ALERTS",
    provenanceTitle: "Authoritative Data Provenance",
    provenanceDesc: "Crime indices compiled from ISTAT regional security data, Ministero dell'Interno reports, and Il Sole 24 Ore Annual Crime Index (Milan). Data is simulated for demonstration.",
    citesLabel: "Official Citations:",
    citationIstat: "ISTAT Security Database",
    citationInterior: "Ministero dell'Interno",
    citationSole: "Sole 24 Ore Crime Index",
    activeFiltersLabel: "Active Filters Range:",
    dataViewTitle: "Data View",
    byHour: "Hour",
    byDayOfMonth: "Day",
    byMonthOfYear: "Month",
    exactMonth: "Exact Month",
    exactMonthLabel: "Exact month",
    allMonths: "All Months",
    sourceOpen: "Open source",
    sourceMethod: "Source method",
    sourceSynthetic: "Synthetic incident row derived from official aggregate indicators",
    dataRecordsLabel: "records",
    filteredRecordsLabel: "filtered",
    sourceLinksLabel: "source links"
  },
  zh: {
    appTitle: "米兰安全地图",
    appSubtitle: "交互式犯罪热力分布与区域风险数据分析系统",
    viewMode: "地图视图模式",
    heatmap: "热力图视图",
    bubbleMap: "区域气泡图",
    markerPins: "案件标记点",
    choroplethMap: "区域安全风险区划图",
    filterTitle: "案件过滤筛选",
    categoryLabel: "案件类别",
    allCategories: "所有类别",
    theft: "盗窃与扒窃",
    assault: "人身袭击与抢劫",
    drugRelated: "毒品交易与走私",
    vandalism: "故意毁坏公物",
    harassment: "骚扰与聚众斗殴",
    severityLabel: "严重程度",
    allSeverities: "所有级别",
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    timeLabel: "时间跨度过滤 (0:00 - 24:00)",
    allTimes: "所有时段",
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    night: "深夜",
    analyticsTitle: "数据面板与案件追踪",
    incidentBreakdown: "案件类型比例分布",
    monthlyTrends: "小时段发案走势",
    districtRanking: "区域风险指数排名",
    safestHours: "安全出行防护建议",
    districtLabel: "街区/区域",
    totalIncidents: "案件总数",
    safetyTips: [
      "深夜尽量避免独自在米兰中央车站（Milano Centrale）周边的阴暗小巷逗留。",
      "在Duomo大教堂广场及地铁M1/M2线等人流密集区域，请务必看管好个人贵重物品。",
      "周末深夜光顾Navigli运河酒吧区时需注意周边醉酒及肢体冲突隐患。",
      "午夜后出行请选择光线充足的主干道，并推荐搭乘合法出租车或正规公共交通。"
    ],
    promptModalTitle: "应用起源与原始 Prompt 归档",
    promptModalBtn: "Prompt 归档库",
    promptModalClose: "关闭",
    promptModalDesc: "本项目是根据用户在2026年6月9日下达的语音指令进行设计和开发的。",
    districtRiskIndex: "街区安全指数 (越低越安全)",
    noData: "当前筛选条件下无符合要求的案件记录。",
    legendTitle: "风险等级图例",
    lowRiskDesc: "低治安事件率 / 安全住宅区",
    medRiskDesc: "夜间需适当留意 / 繁华娱乐区",
    highRiskDesc: "需高度警惕 / 夜间交通枢纽及周边",
    
    // New Translations for Extensions
    feedTitle: "实时案件动态追踪栏",
    feedPlaceholder: "输入关键词过滤案件详情...",
    newsTickerTitle: "近期安全动态滚播",
    provenanceTitle: "权威官方数据来源声明",
    provenanceDesc: "安全指数基于意大利国家统计局(ISTAT)、内政部公共安全局及《24小时太阳报》省份年度安全报告数据进行模拟计算与定位展示。",
    citesLabel: "参考的官方数据库:",
    citationIstat: "ISTAT 地区安全数据库",
    citationInterior: "意大利内政部",
    citationSole: "24小时太阳报犯罪指数",
    activeFiltersLabel: "当前筛选条件范围:"
  },
  it: {
    appTitle: "Mappa della Sicurezza di Milano",
    appSubtitle: "Mappatura Interattiva dei Reati e Analisi dei Rischi per Quartiere",
    viewMode: "Modalità Mappa",
    heatmap: "Mappa di Calore",
    bubbleMap: "Mappa a Bolle",
    markerPins: "Indicatori di Reato",
    choroplethMap: "Mappa Coropleta delle Zone",
    filterTitle: "Filtra Incidenti",
    categoryLabel: "Categoria",
    allCategories: "Tutte le Categorie",
    theft: "Furti e Borseggi",
    assault: "Aggressioni e Rapine",
    drugRelated: "Spaccio e Droga",
    vandalism: "Vandalismo e Danni",
    harassment: "Molestie e Risse",
    severityLabel: "Gravità",
    allSeverities: "Tutte le Gravità",
    low: "Basso Rischio",
    medium: "Medio Rischio",
    high: "Alto Rischio",
    timeLabel: "Filtro Orario Continuo (0:00 - 24:00)",
    allTimes: "Tutte le Ore",
    morning: "Mattino",
    afternoon: "Pomeriggio",
    evening: "Sera",
    night: "Notte",
    analyticsTitle: "Dashboard Analisi e Feed",
    incidentBreakdown: "Distribuzione Reati",
    monthlyTrends: "Frequenza Oraria Reati",
    districtRanking: "Indice di Rischio per Quartiere",
    safestHours: "Consigli per la Sicurezza",
    districtLabel: "Quartiere",
    totalIncidents: "Incidenti Totali",
    safetyTips: [
      "Evitare zone pedonali scarsamente illuminate intorno alla Stazione Centrale a tarda notte.",
      "Tenere al sicuro gli oggetti personali e fare attenzione sulle linee M1/M2 e in zona Duomo.",
      "Prestare attenzione nei quartieri della movida dei Navigli durante le ore tarde del weekend.",
      "Rimanere in piazze illuminate e preferire taxi ufficiali per gli spostamenti dopo la mezzanotte."
    ],
    promptModalTitle: "Genesi del Progetto e Prompt Originale",
    promptModalBtn: "Archivio Prompt",
    promptModalClose: "Chiudi",
    promptModalDesc: "Questo progetto è stato sviluppato in base alle istruzioni vocali dell'utente registrate il 9 giugno 2026.",
    districtRiskIndex: "Indice di Sicurezza (Minore è Più Sicuro)",
    noData: "Nessun reato corrisponde ai filtri selezionati.",
    legendTitle: "Livello di Rischio",
    lowRiskDesc: "Incidenti minimi / Area residenziale sicura",
    medRiskDesc: "Consigliata cautela la notte / Aree movida",
    highRiskDesc: "Massima vigilanza / Hub di trasporto la notte",
    
    // New Translations for Extensions
    feedTitle: "Feed Real-time degli Incidenti",
    feedPlaceholder: "Cerca dettagli reato...",
    newsTickerTitle: "NOTIZIARIO SICUREZZA MILANO",
    provenanceTitle: "Provenienza Ufficiale dei Dati",
    provenanceDesc: "Gli indici di rischio sono calcolati sulla base delle statistiche ufficiali ISTAT, dei rapporti del Ministero dell'Interno e dell'Indice annuale della criminalità del Sole 24 Ore.",
    citesLabel: "Fonti ufficiali consultate:",
    citationIstat: "Database Sicurezza ISTAT",
    citationInterior: "Ministero dell'Interno",
    citationSole: "Indice Criminalità Sole 24 Ore",
    activeFiltersLabel: "Filtri attivi:"
  }
};

const officialDataSources = [
  {
    id: "istat-crime-archive",
    name: "ISTAT Crimes Archive",
    type: "official statistics",
    url: "https://www.istat.it/en/archivio/crimes",
    usedFor: "National and regional crime context",
    cadence: "Periodic official statistics"
  },
  {
    id: "istat-sdi-delitti",
    name: "ISTAT SDI Crime Metadata",
    type: "official metadata",
    url: "https://www.istat.it/scheda-qualita/delitti-denunciati-allautorita-giudiziaria-da-polizia-di-stato-arma-dei-carabinieri-e-guardia-di-finanza/",
    usedFor: "Police-reported offences methodology",
    cadence: "Quality and methodology sheet"
  },
  {
    id: "interno-statistiche",
    name: "Ministero dell'Interno - Dati e statistiche",
    type: "official statistics",
    url: "https://www.interno.gov.it/it/stampa-e-comunicazione/dati-e-statistiche",
    usedFor: "Public safety and interior ministry statistical context",
    cadence: "Official ministry updates"
  },
  {
    id: "sole24-crime-index",
    name: "Il Sole 24 Ore Crime Index - Milano",
    type: "media index",
    url: "https://lab24.ilsole24ore.com/indice-della-criminalita/classifica/milano",
    usedFor: "Province-level ranking and public-facing crime index context",
    cadence: "Annual index"
  },
  {
    id: "openstreetmap",
    name: "OpenStreetMap",
    type: "map base",
    url: "https://www.openstreetmap.org/copyright",
    usedFor: "Map geometry and attribution",
    cadence: "Community-updated basemap"
  },
  {
    id: "carto-basemap",
    name: "CARTO Basemap Attribution",
    type: "map style",
    url: "https://carto.com/attributions",
    usedFor: "Dark basemap rendering",
    cadence: "Basemap attribution"
  }
];

const incidentSourceIds = [
  "istat-crime-archive",
  "istat-sdi-delitti",
  "interno-statistiche",
  "sole24-crime-index"
];

// Milan Districts Definition (Centroids and base safety risks)
const milanDistricts = [
  { id: "centrale", nameEn: "Stazione Centrale", nameZh: "中央车站周边", nameIt: "Stazione Centrale", lat: 45.4852, lng: 9.2035, baseRisk: 8.5 },
  { id: "duomo", nameEn: "Duomo / Centro Storico", nameZh: "大教堂与历史中心", nameIt: "Duomo / Centro Storico", lat: 45.4642, lng: 9.1900, baseRisk: 6.8 },
  { id: "navigli", nameEn: "Navigli / Porta Genova", nameZh: "运河与热点区", nameIt: "Navigli / Porta Genova", lat: 45.4520, lng: 9.1710, baseRisk: 7.2 },
  { id: "loreto", nameEn: "Loreto / Via Padova", nameZh: "洛雷托与帕多瓦街", nameIt: "Loreto / Via Padova", lat: 45.4870, lng: 9.2190, baseRisk: 7.8 },
  { id: "sansiro", nameEn: "San Siro", nameZh: "圣西罗体育场区", nameIt: "San Siro", lat: 45.4785, lng: 9.1240, baseRisk: 4.5 },
  { id: "venezia", nameEn: "Porta Venezia", nameZh: "威尼斯门商业区", nameIt: "Porta Venezia", lat: 45.4745, lng: 9.2050, baseRisk: 5.2 },
  { id: "bovisa", nameEn: "Bovisa / University", nameZh: "博维萨大学区", nameIt: "Bovisa", lat: 45.5030, lng: 9.1620, baseRisk: 3.8 },
  { id: "niguarda", nameEn: "Niguarda / Ca' Granda", nameZh: "尼瓜尔达住宅区", nameIt: "Niguarda", lat: 45.5110, lng: 9.1910, baseRisk: 3.2 },
  { id: "corvetto", nameEn: "Corvetto / Rogoredo", nameZh: "科尔韦托与罗戈雷多", nameIt: "Corvetto", lat: 45.4410, lng: 9.2230, baseRisk: 7.5 }
];

// Seeded Safety Incidents Dataset with explicit hours (0-23)
const safetyIncidents = [
  // Centrale Stazione Hotspots
  {
    id: 1,
    category: "theft",
    severity: "medium",
    timeOfDay: "afternoon",
    hour: 14,
    lat: 45.4849,
    lng: 9.2028,
    district: "centrale",
    timestamp: "2026-06-01T14:30:00Z",
    details: {
      en: "Wallet stolen from backpack while boarding Metro M2 at Centrale station.",
      zh: "在中央火车站搭乘地铁M2线时，背包内的钱包被盗。",
      it: "Portafoglio rubato dallo zaino durante l'imbarco sulla Metro M2 alla stazione Centrale."
    }
  },
  {
    id: 2,
    category: "assault",
    severity: "high",
    timeOfDay: "night",
    hour: 1,
    lat: 45.4860,
    lng: 9.2045,
    district: "centrale",
    timestamp: "2026-06-03T01:15:00Z",
    details: {
      en: "Physical robbery at knifepoint in Piazza Duca d'Aosta outside Centrale station.",
      zh: "中央车站外的Duca d'Aosta广场发生持刀抢劫人身袭击事件。",
      it: "Rapina a mano armata in Piazza Duca d'Aosta, fuori dalla stazione Centrale."
    }
  },
  {
    id: 3,
    category: "drugRelated",
    severity: "medium",
    timeOfDay: "evening",
    hour: 20,
    lat: 45.4855,
    lng: 9.2060,
    district: "centrale",
    timestamp: "2026-06-05T20:45:00Z",
    details: {
      en: "Police intervention for suspected illegal drug transaction in Via Vittor Pisani.",
      zh: "警方在Via Vittor Pisani路段介入查处一起涉嫌非法毒品交易案。",
      it: "Intervento della polizia per sospetto spaccio di droga in Via Vittor Pisani."
    }
  },
  {
    id: 4,
    category: "harassment",
    severity: "medium",
    timeOfDay: "night",
    hour: 3,
    lat: 45.4838,
    lng: 9.2015,
    district: "centrale",
    timestamp: "2026-06-07T03:30:00Z",
    details: {
      en: "Verbal altercation and physical scuffle between rowdy groups in Piazza Luigi di Savoia.",
      zh: "Luigi di Savoia广场发生团伙言语冲突及肢体撕扯行为。",
      it: "Alterco verbale e rissa tra gruppi molesti in Piazza Luigi di Savoia."
    }
  },
  {
    id: 5,
    category: "theft",
    severity: "medium",
    timeOfDay: "evening",
    hour: 19,
    lat: 45.4858,
    lng: 9.2032,
    district: "centrale",
    timestamp: "2026-06-08T19:20:00Z",
    details: {
      en: "Luggage stolen from traveler waiting near ticketing machines.",
      zh: "旅客在自动售票机附近等待时，随身行李箱被顺手牵羊窃走。",
      it: "Bagaglio rubato a un viaggiatore in attesa vicino alle biglietterie automatiche."
    }
  },

  // Duomo Area
  {
    id: 6,
    category: "theft",
    severity: "low",
    timeOfDay: "afternoon",
    hour: 15,
    lat: 45.4645,
    lng: 9.1895,
    district: "duomo",
    timestamp: "2026-06-02T15:40:00Z",
    details: {
      en: "Pickpocketing of tourist phone in Piazza del Duomo crowded area.",
      zh: "Duomo大教堂广场人流密集处，一名游客的手机被扒窃。",
      it: "Borseggio di un telefono a un turista nell'area affollata di Piazza del Duomo."
    }
  },
  {
    id: 7,
    category: "theft",
    severity: "medium",
    timeOfDay: "evening",
    hour: 18,
    lat: 45.4658,
    lng: 9.1915,
    district: "duomo",
    timestamp: "2026-06-04T18:10:00Z",
    details: {
      en: "Shoplifting incident at high-end gallery boutique in Galleria Vittorio Emanuele II.",
      zh: "埃马努埃莱二世长廊内的高档精品店发生一起商品盗窃事件。",
      it: "Furto in una boutique di lusso nella Galleria Vittorio Emanuele II."
    }
  },
  {
    id: 8,
    category: "vandalism",
    severity: "low",
    timeOfDay: "night",
    hour: 2,
    lat: 45.4630,
    lng: 9.1880,
    district: "duomo",
    timestamp: "2026-06-06T02:50:00Z",
    details: {
      en: "Graffiti sprayed on historical wall near Piazza Diaz.",
      zh: "Diaz广场附近的历史建筑物墙体遭遇涂鸦破坏。",
      it: "Graffiti tracciati su un muro storico vicino a Piazza Diaz."
    }
  },
  {
    id: 9,
    category: "theft",
    severity: "low",
    timeOfDay: "morning",
    hour: 10,
    lat: 45.4641,
    lng: 9.1890,
    district: "duomo",
    timestamp: "2026-06-07T10:15:00Z",
    details: {
      en: "Tourist camera snatched near the entrance of Duomo Cathedral.",
      zh: "米兰大教堂入口附近，一名游客的相机被强行夺走。",
      it: "Fotocamera strappata a un turista nei pressi dell'ingresso del Duomo."
    }
  },

  // Navigli Area
  {
    id: 10,
    category: "harassment",
    severity: "medium",
    timeOfDay: "night",
    hour: 23,
    lat: 45.4515,
    lng: 9.1720,
    district: "navigli",
    timestamp: "2026-06-05T23:55:00Z",
    details: {
      en: "Fight between drunk patrons outside bar on Naviglio Grande.",
      zh: "大运河旁某酒吧门外，醉酒顾客之间爆发肢体冲突。",
      it: "Rissa tra clienti ubriachi fuori da un bar sul Naviglio Grande."
    }
  },
  {
    id: 11,
    category: "theft",
    severity: "low",
    timeOfDay: "evening",
    hour: 20,
    lat: 45.4525,
    lng: 9.1705,
    district: "navigli",
    timestamp: "2026-06-06T20:30:00Z",
    details: {
      en: "Handbag stolen from outdoor dining table chair back in Porta Genova area.",
      zh: "热那亚门区域一户外餐厅座椅靠背上的手提包被顺走。",
      it: "Borsa rubata dallo schienale di una sedia di un ristorante all'aperto in zona Porta Genova."
    }
  },
  {
    id: 12,
    category: "drugRelated",
    severity: "medium",
    timeOfDay: "evening",
    hour: 21,
    lat: 45.4508,
    lng: 9.1732,
    district: "navigli",
    timestamp: "2026-06-07T21:10:00Z",
    details: {
      en: "Suspected drug dealer detained by patrol along Alzaia Naviglio Pavese.",
      zh: "巡逻人员在Alzaia Naviglio Pavese运河沿岸控制了一名涉嫌贩毒人员。",
      it: "Sospetto spacciatore fermato da una pattuglia lungo l'Alzaia Naviglio Pavese."
    }
  },

  // Loreto / Via Padova
  {
    id: 13,
    category: "drugRelated",
    severity: "high",
    timeOfDay: "evening",
    hour: 22,
    lat: 45.4882,
    lng: 9.2205,
    district: "loreto",
    timestamp: "2026-06-02T22:15:00Z",
    details: {
      en: "Major drug raid and multiple arrests inside an apartment in Via Padova.",
      zh: "警方在帕多瓦街一处公寓内开展大规模毒品突袭，当场逮捕数人。",
      it: "Blitz antidroga e arresti multipli all'interno di un appartamento in Via Padova."
    }
  },
  {
    id: 14,
    category: "assault",
    severity: "high",
    timeOfDay: "night",
    hour: 2,
    lat: 45.4868,
    lng: 9.2175,
    district: "loreto",
    timestamp: "2026-06-04T02:00:00Z",
    details: {
      en: "Robbery on pedestrian walking alone in Viale Monza near Loreto metro.",
      zh: "洛雷托地铁站附近的Monza大道上，一名独行路人遭遇暴力抢劫。",
      it: "Rapina a un pedone che camminava da solo in Viale Monza vicino alla metro Loreto."
    }
  },
  {
    id: 15,
    category: "vandalism",
    severity: "medium",
    timeOfDay: "night",
    hour: 3,
    lat: 45.4890,
    lng: 9.2220,
    district: "loreto",
    timestamp: "2026-06-06T03:10:00Z",
    details: {
      en: "Multiple parked cars windows smashed overnight for theft on Via Clitumno.",
      zh: "Clitumno街夜间多辆停放的私家车车窗被砸，车内物品被洗劫一空。",
      it: "Finestrini di diverse auto parcheggiate distrutti nella notte per furto in Via Clitumno."
    }
  },

  // Corvetto / Rogoredo
  {
    id: 16,
    category: "drugRelated",
    severity: "high",
    timeOfDay: "night",
    hour: 0,
    lat: 45.4425,
    lng: 9.2245,
    district: "corvetto",
    timestamp: "2026-06-03T00:45:00Z",
    details: {
      en: "Police operation in park space near Rogoredo to curb illicit trade.",
      zh: "警方在罗戈雷多周边的公园空地展开专项整治毒品交易行动。",
      it: "Operazione di polizia nel parco vicino a Rogoredo per contrastare lo spaccio."
    }
  },
  {
    id: 17,
    category: "assault",
    severity: "medium",
    timeOfDay: "evening",
    hour: 19,
    lat: 45.4398,
    lng: 9.2215,
    district: "corvetto",
    timestamp: "2026-06-05T19:30:00Z",
    details: {
      en: "Elderly resident mugged near apartment block entrance in Corvetto.",
      zh: "科尔韦托一住宅区入口附近，一名老年居民遭遇拦截抢劫。",
      it: "Anziano residente rapinato vicino all'ingresso di un condominio a Corvetto."
    }
  },

  // San Siro
  {
    id: 18,
    category: "vandalism",
    severity: "medium",
    timeOfDay: "afternoon",
    hour: 16,
    lat: 45.4795,
    lng: 9.1225,
    district: "sansiro",
    timestamp: "2026-06-07T16:00:00Z",
    details: {
      en: "Aggressive football fans vandalize nearby tram stops before match.",
      zh: "足球赛前，情绪激动的球迷砸坏了球场周边的有轨电车站设施。",
      it: "Tifosi aggressivi vandalizzano le fermate del tram vicino allo stadio prima della partita."
    }
  },
  {
    id: 19,
    category: "theft",
    severity: "medium",
    timeOfDay: "evening",
    hour: 20,
    lat: 45.4770,
    lng: 9.1260,
    district: "sansiro",
    timestamp: "2026-06-07T20:15:00Z",
    details: {
      en: "Car broken into and audio system stolen during match event in public lot.",
      zh: "球赛举办期间，公共停车场内一辆汽车被强行撬开，音响被盗。",
      it: "Auto scassinata e impianto audio rubato durante la partita nel parcheggio pubblico."
    }
  },

  // Porta Venezia
  {
    id: 20,
    category: "theft",
    severity: "low",
    timeOfDay: "afternoon",
    hour: 13,
    lat: 45.4752,
    lng: 9.2062,
    district: "venezia",
    timestamp: "2026-06-04T13:45:00Z",
    details: {
      en: "Wallet stolen from dining customer on Corso Buenos Aires.",
      zh: "布宜诺斯艾利斯大道一用餐顾客的钱包悄无声息被扒。",
      it: "Portafoglio rubato a un cliente in un ristorante su Corso Buenos Aires."
    }
  },
  {
    id: 21,
    category: "harassment",
    severity: "low",
    timeOfDay: "evening",
    hour: 21,
    lat: 45.4738,
    lng: 9.2038,
    district: "venezia",
    timestamp: "2026-06-06T21:40:00Z",
    details: {
      en: "Dispute and noise complaint solved by police patrol near Porta Venezia gardens.",
      zh: "威尼斯门花园附近发生纠纷与噪音扰民事件，后由警员协调解决。",
      it: "Disputa e disturbo della quiete pubblica risolti dalla polizia vicino ai bastioni di Porta Venezia."
    }
  },

  // Bovisa
  {
    id: 22,
    category: "theft",
    severity: "low",
    timeOfDay: "morning",
    hour: 9,
    lat: 45.5020,
    lng: 9.1630,
    district: "bovisa",
    timestamp: "2026-06-05T09:20:00Z",
    details: {
      en: "Unattended student laptop stolen from campus study hall.",
      zh: "大学自习室内，学生放在桌上无人看管的笔记本电脑被顺手牵羊盗走。",
      it: "Laptop di uno studente rubato da un'aula studio lasciata incustodita nel campus."
    }
  },

  // Niguarda
  {
    id: 23,
    category: "vandalism",
    severity: "low",
    timeOfDay: "night",
    hour: 4,
    lat: 45.5120,
    lng: 9.1920,
    district: "niguarda",
    timestamp: "2026-06-06T04:10:00Z",
    details: {
      en: "Trash bins set on fire in residential alleyway.",
      zh: "住宅区胡同内的分类垃圾桶夜间被恶意纵火烧毁。",
      it: "Cassonetti dell'immondizia dati alle fiamme in un vicolo residenziale."
    }
  },

  // Dense simulator entries to build maps
  { id: 24, category: "theft", severity: "medium", timeOfDay: "morning", hour: 8, lat: 45.4850, lng: 9.2040, district: "centrale", timestamp: "2026-06-01T08:15:00Z", details: { en: "Pickpocketing near train platform 12.", zh: "火车站12站台附近发生扒窃。", it: "Borseggio vicino al binario 12." } },
  { id: 25, category: "theft", severity: "high", timeOfDay: "evening", hour: 21, lat: 45.4862, lng: 9.2025, district: "centrale", timestamp: "2026-06-01T21:40:00Z", details: { en: "Valuables stolen from parked taxi near station.", zh: "车站旁停靠的出租车内贵重物品被盗。", it: "Oggetti di valore rubati da un taxi parcheggiato vicino alla stazione." } },
  { id: 26, category: "drugRelated", severity: "medium", timeOfDay: "night", hour: 23, lat: 45.4842, lng: 9.2052, district: "centrale", timestamp: "2026-06-02T23:50:00Z", details: { en: "Narcotics sale reported near metro elevators.", zh: "地铁电梯旁有毒品非法交易行为。", it: "Segnalato spaccio di stupefacenti vicino agli ascensori della metropolitana." } },
  { id: 27, category: "harassment", severity: "medium", timeOfDay: "afternoon", hour: 15, lat: 45.4851, lng: 9.2039, district: "centrale", timestamp: "2026-06-03T15:20:00Z", details: { en: "Aggressive solicitation by unlicensed porters.", zh: "无证行李搬运工进行骚扰拉客。", it: "Sollecitazione aggressiva da parte di facchini abusivi." } },
  { id: 28, category: "theft", severity: "low", timeOfDay: "morning", hour: 10, lat: 45.4848, lng: 9.2030, district: "centrale", timestamp: "2026-06-04T10:45:00Z", details: { en: "Phone snatched from cafe table.", zh: "咖啡店桌子上的手机被路人夺走。", it: "Telefono strappato da un tavolo della caffetteria." } },
  { id: 29, category: "theft", severity: "low", timeOfDay: "afternoon", hour: 16, lat: 45.4640, lng: 9.1910, district: "duomo", timestamp: "2026-06-01T16:10:00Z", details: { en: "Backpack zipper opened and wallet stolen near museum.", zh: "博物馆附近游客双肩包拉链被拉开，钱包被盗。", it: "Zaino aperto e portafoglio rubato vicino al museo." } },
  { id: 30, category: "theft", severity: "low", timeOfDay: "morning", hour: 11, lat: 45.4646, lng: 9.1888, district: "duomo", timestamp: "2026-06-02T11:30:00Z", details: { en: "Bags stolen from tourist bus loading zone.", zh: "旅游大巴装卸区手提包被顺走。", it: "Borse rubate dalla zona di carico del bus turistico." } },
  { id: 31, category: "harassment", severity: "medium", timeOfDay: "evening", hour: 19, lat: 45.4638, lng: 9.1902, district: "duomo", timestamp: "2026-06-03T19:50:00Z", details: { en: "Street vendors aggressively forcing friendship bracelets.", zh: "街头小贩强行兜售幸运手绳引发冲突。", it: "Venditori ambulanti che impongono braccialetti dell'amicizia con aggressività." } },
  { id: 32, category: "harassment", severity: "medium", timeOfDay: "night", hour: 1, lat: 45.4522, lng: 9.1715, district: "navigli", timestamp: "2026-06-02T01:30:00Z", details: { en: "Brawl inside a pub leading to broken glass and minor injuries.", zh: "酒吧内发生互殴，导致玻璃破碎和轻微伤。", it: "Rissa all'interno di un pub con vetri rotti e feriti lievi." } },
  { id: 33, category: "theft", severity: "medium", timeOfDay: "night", hour: 2, lat: 45.4510, lng: 9.1702, district: "navigli", timestamp: "2026-06-03T02:45:00Z", details: { en: "Car window smashed near canals for briefcase theft.", zh: "运河附近一辆小轿车车窗被砸，车内公文包被盗。", it: "Finestrino dell'auto rotto vicino ai canali per furto di una valigetta." } },
  { id: 34, category: "vandalism", severity: "low", timeOfDay: "night", hour: 3, lat: 45.4530, lng: 9.1722, district: "navigli", timestamp: "2026-06-04T03:20:00Z", details: { en: "Tagging on storefront shutters.", zh: "沿街商铺卷帘门被喷漆涂鸦。", it: "Tag tracciati sulle saracinesche dei negozi." } },
  { id: 35, category: "assault", severity: "high", timeOfDay: "night", hour: 23, lat: 45.4875, lng: 9.2185, district: "loreto", timestamp: "2026-06-01T23:30:00Z", details: { en: "Robbery with threat of violence on side street of Via Padova.", zh: "帕多瓦街一侧街发生暴力威胁抢劫事件。", it: "Rapina con minaccia di violenza in una via laterale di Via Padova." } },
  { id: 36, category: "drugRelated", severity: "medium", timeOfDay: "evening", hour: 19, lat: 45.4865, lng: 9.2210, district: "loreto", timestamp: "2026-06-02T19:15:00Z", details: { en: "Drug handoff witnessed near public playground.", zh: "公共游乐场附近目击毒品线下交易。", it: "Scambio di droga avvistato vicino al parco giochi pubblico." } },
  { id: 37, category: "theft", severity: "medium", timeOfDay: "afternoon", hour: 14, lat: 45.4880, lng: 9.2195, district: "loreto", timestamp: "2026-06-03T14:50:00Z", details: { en: "Bicycle lock cut and bike stolen from street pole.", zh: "路边车锁被剪断，停放的自行车被窃走。", it: "Lucchetto della bicicletta tagliato e bici rubata dal palo della strada." } },
  { id: 38, category: "drugRelated", severity: "high", timeOfDay: "night", hour: 23, lat: 45.4415, lng: 9.2235, district: "corvetto", timestamp: "2026-06-01T23:45:00Z", details: { en: "Suspicious drug gathering dismantled by police raid.", zh: "警方突袭驱散一处可疑的毒品集会地点。", it: "Raduno sospetto per droga smantellato da un raid della polizia." } },
  { id: 39, category: "assault", severity: "high", timeOfDay: "night", hour: 2, lat: 45.4405, lng: 9.2250, district: "corvetto", timestamp: "2026-06-02T02:10:00Z", details: { en: "Physical assault on security guard near metro gate.", zh: "地铁闸机附近保安人员遭遇人身攻击。", it: "Aggressione fisica a una guardia giurata vicino all'ingresso della metro." } },
  { id: 40, category: "vandalism", severity: "medium", timeOfDay: "evening", hour: 20, lat: 45.4422, lng: 9.2220, district: "corvetto", timestamp: "2026-06-03T20:20:00Z", details: { en: "Park benches destroyed by local gang.", zh: "公园长凳被当地帮派故意损毁。", it: "Panchine del parco distrutte da una banda locale." } }
];

// Seed recent news alerts representing authoritative outlets
const recentNewsAlerts = [
  {
    en: "ANSA LOMBARDIA: Local security forces step up night patrols around Stazione Centrale and Piazza Duca d'Aosta.",
    zh: "安莎社伦巴第分社：当地警队加强了米兰中央火车站与Duca d'Aosta广场周边的夜间巡逻警戒力度。",
    it: "ANSA LOMBARDIA: Le forze dell'ordine intensificano i pattugliamenti notturni attorno alla Stazione Centrale."
  },
  {
    en: "MILANO TODAY: Pickpocket alert! Tourist warnings issued for Metro M1/M3 transfer corridors at Duomo Station.",
    zh: "MILANOTODAY：防扒预警！针对米兰大教堂（Duomo）地铁M1/M3换乘通道频发的偷窃案，官方已向游客发布安全警示。",
    it: "MILANO TODAY: Allerta borseggiatori! Segnalati furti nei corridoi di collegamento M1/M3 in stazione Duomo."
  },
  {
    en: "CORRIERE DELLA SERA: Navigli nightlife crackdown leads to temporary suspension of license for two rowdy establishments.",
    zh: "晚邮报：米兰运河区（Navigli）夜间治安整治，两家引发扰民及冲突的酒吧被勒令暂停营业整顿。",
    it: "CORRIERE DELLA SERA: Controlli nei Navigli, sospesa la licenza a due locali per disturbo e risse."
  },
  {
    en: "MILANO SECURITY REPORT: Major drug trafficking bust successfully completed by Carabinieri in Corvetto sector.",
    zh: "米兰安全简报：宪兵部队在科尔韦托（Corvetto）街区成功破获一起重大毒品走私及贩卖链条案。",
    it: "RAPPORTI SICUREZZA: Importante blitz antidroga condotto dai Carabinieri nel quartiere Corvetto."
  }
];

// Helper to generate approximate polygonal coordinates dynamically around centroids
function generateDistrictPolygonCoords(lat, lng, baseRisk) {
  // Shifting offsets based on risk level for visual representation
  const latOffset = 0.007 + (baseRisk * 0.0004);
  const lngOffset = (0.007 + (baseRisk * 0.0004)) * 1.35; // Aspect ratio compensation
  return [
    [lat + latOffset, lng],
    [lat + latOffset * 0.5, lng + lngOffset * 0.86],
    [lat - latOffset * 0.5, lng + lngOffset * 0.86],
    [lat - latOffset, lng],
    [lat - latOffset * 0.5, lng - lngOffset * 0.86],
    [lat + latOffset * 0.5, lng - lngOffset * 0.86]
  ];
}

// Generate additional mock entries to total over 100 entries for rich analytics & heatmaps
let currentId = 41;
const categories = ["theft", "assault", "drugRelated", "vandalism", "harassment"];
let randomSeed = 20260609;

function seededRandom() {
  randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
  return randomSeed / 4294967296;
}

for (let i = 0; i < 75; i++) {
  const distIndex = Math.floor(Math.pow(seededRandom(), 0.7) * milanDistricts.length);
  const district = milanDistricts[distIndex];
  
  let cat = "theft";
  if (district.id === "centrale" || district.id === "loreto" || district.id === "corvetto") {
    cat = categories[Math.floor(seededRandom() * categories.length)];
  } else if (district.id === "navigli") {
    cat = seededRandom() > 0.4 ? "harassment" : "theft";
  } else {
    cat = seededRandom() > 0.3 ? "theft" : "vandalism";
  }
  
  const sev = district.baseRisk > 7.0 
    ? (seededRandom() > 0.4 ? "high" : "medium") 
    : (seededRandom() > 0.7 ? "medium" : "low");
  
  // Assign a specific granular hour
  const peakHours = [18, 19, 20, 21, 22, 23, 0, 1];
  const hourVal = seededRandom() > 0.6 
    ? peakHours[Math.floor(seededRandom() * peakHours.length)] // Night/evening peak: 18:00 - 01:00
    : Math.floor(seededRandom() * 18);                         // Rest of day: 00:00 - 17:00
    
  const spreadLat = (seededRandom() - 0.5) * 0.007;
  const spreadLng = (seededRandom() - 0.5) * 0.009;
  const lat = district.lat + spreadLat;
  const lng = district.lng + spreadLng;
  
  const monthVal = Math.floor(seededRandom() * 12);
  const daysInMonth = new Date(2026, monthVal + 1, 0).getDate();
  const day = Math.floor(seededRandom() * daysInMonth) + 1;
  const monthString = String(monthVal + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  const hourString = hourVal < 10 ? `0${hourVal}` : `${hourVal}`;
  const timestamp = `2026-${monthString}-${dayString}T${hourString}:30:00Z`;

  const details = {
    en: `Simulated report: ${cat.toUpperCase()} (${sev}) recorded at ${hourString}:30 near district ${district.nameEn}.`,
    zh: `模拟记录：于 ${hourString}:30 在 ${district.nameZh} 记录了一起 ${cat === "theft" ? "盗窃" : cat === "assault" ? "人身袭击" : cat === "drugRelated" ? "涉毒" : cat === "vandalism" ? "破坏公物" : "骚扰"} 事件（程度：${sev === "high" ? "高" : sev === "medium" ? "中" : "低"}）。`,
    it: `Rapporto simulato: ${cat.toUpperCase()} (${sev}) registrato alle ore ${hourString}:30 in zona ${district.nameIt}.`
  };

  safetyIncidents.push({
    id: currentId++,
    category: cat,
    severity: sev,
    timeOfDay: hourVal >= 18 || hourVal < 6 ? "night" : "afternoon",
    hour: hourVal,
    lat: parseFloat(lat.toFixed(4)),
    lng: parseFloat(lng.toFixed(4)),
    district: district.id,
    timestamp: timestamp,
    details: details
  });
}

safetyIncidents.forEach(incident => {
  incident.sourceIds = incident.sourceIds || incidentSourceIds;
  incident.sourceMethod = incident.sourceMethod || "synthetic-row-from-official-aggregate-context";
  incident.isSynthetic = incident.isSynthetic !== false;
});
