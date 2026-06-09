# Milan Safety Map

Interactive experimental map and dashboard for inspecting official annual reported-offence aggregates from the Comune di Milano open data portal.

## What This Is

This is a static frontend prototype. It loads real public records from Comune di Milano dataset DS564, "Reati denunciati all'autorita giudiziaria dalla forze di polizia (2004 - 2023)", and visualizes annual city-level counts by crime type.

The public DS564 source is not an incident-level feed. It does not include hour, day-of-month, month-of-year, exact month, street address, district, or incident coordinates. The app surfaces those limitations in the UI instead of filling missing fields.

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
- OpenStreetMap attribution: https://www.openstreetmap.org/copyright
- CARTO attribution: https://carto.com/attributions

Comune di Milano lists DS564 as CC BY 4.0, with annual frequency, Milan geographic coverage, and temporal coverage from 2004-01-01 to 2023-12-31.

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
