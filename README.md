# Milan Safety Map

Interactive experimental dashboard for inspecting official Milan reported-offence aggregates and a separate source-linked news-document heatmap.

## What This Is

This is a static frontend prototype with two deliberately separate views.

View 1, **Official Stats Grid**, loads real public records from Comune di Milano dataset DS564, "Reati denunciati all'autorita giudiziaria dalla forze di polizia (2004 - 2023)", and visualizes annual city-level counts by crime type. It does not show a Milan map because DS564 is city-level annual data.

View 2, **News Heatmap**, loads a bundled real-data snapshot from GDELT 2.1 Global Knowledge Graph export CSV files. The snapshot currently contains 60 deduplicated source records: 20 from 2026 and 40 from 2025. Each row keeps the original source URL and the GDELT export CSV URL so users can inspect provenance directly.

The public DS564 source is not an incident-level feed. It does not include hour, day-of-month, month-of-year, exact month, street address, district, or incident coordinates. The app surfaces those limitations in the UI instead of filling missing fields.

The GDELT layer is also not incident-level data. It is a news-document/source URL mention layer: GDELT records are filtered for Milan/Milano location mentions, safety/crime themes or URL terms are prioritized, and geography is processed from GDELT location mentions plus source URL place keywords. It is useful for inspecting source-linked news-document signals, not for measuring crime rates or personal risk.

## Important Disclaimer

This project is experimental and educational. It is not legal advice, safety advice, travel advice, policing guidance, risk scoring guidance, or an official public-safety product.

Do not use this project to make real-world safety, legal, law-enforcement, insurance, housing, employment, travel, investment, or personal-risk decisions. Data and code may contain errors, simplifications, stale references, source outages, parsing issues, or visualization mistakes.

Always consult current news, official public authorities, and authoritative data sources before relying on any safety-related information.

## Data Sources And Provenance

The app exposes source URLs directly in the UI. Current source references include:

- Comune di Milano DS564 landing page: https://dati.comune.milano.it/dataset/ds564-reati-denunciati-all-autorita-giudiziaria-dalla-forze-di-polizia-2004-avanti
- Comune di Milano CKAN Data API: https://dati.comune.milano.it/api/3/action/datastore_search?resource_id=8b03b9f2-f2d7-4408-b439-bc6efc093cff&limit=5000
- Official CSV file: https://dati.comune.milano.it/dataset/34e2d2af-5c3b-4768-918b-ab7e5c0d15da/resource/8b03b9f2-f2d7-4408-b439-bc6efc093cff/download/ds564_reati_denunciati_2004_2023.csv
- Official JSON file: https://dati.comune.milano.it/dataset/34e2d2af-5c3b-4768-918b-ab7e5c0d15da/resource/3227db9d-8802-4b00-b237-0618380dab1d/download/ds564_reati_denunciati_2004_2023.json
- Milano Statistica source path: https://milanostatistica.comune.milano.it/
- GDELT 2.1 data documentation: https://www.gdeltproject.org/data.html
- GDELT 2.1 master file list: http://data.gdeltproject.org/gdeltv2/masterfilelist.txt
- OpenStreetMap attribution: https://www.openstreetmap.org/copyright
- CARTO attribution: https://carto.com/attributions

Comune di Milano lists DS564 as CC BY 4.0, with annual frequency, Milan geographic coverage, and temporal coverage from 2004-01-01 to 2023-12-31.

The news-document snapshot is generated from public GDELT GKG export files and stored in `news-data.js` for stable GitHub Pages loading. Source article labels are derived from source URL slugs when GDELT does not provide article headlines; users should open the source URL before interpreting any row.

## Project Links

- GitHub repository: https://github.com/learnbydoingwithsteven/milan-safety
- GitHub Pages project URL: https://learnbydoingwithsteven.github.io/milan-safety/
- Personal page: https://learnbydoingwithsteven.github.io/
- Linktree: https://linktr.ee/learnbydoingwithsteven

## Local Use

Open `index.html` directly, or serve the folder locally:

```powershell
py -m http.server 8765 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8765/
```

## License

Primary project license: AGPL-3.0-or-later. See [LICENSE](LICENSE).

The Apache-2.0 license text is included in [LICENSE-APACHE-2.0.txt](LICENSE-APACHE-2.0.txt) for separately marked files or future components that explicitly use `SPDX-License-Identifier: Apache-2.0`. Unless a file says otherwise, project files are licensed under AGPL-3.0-or-later.
