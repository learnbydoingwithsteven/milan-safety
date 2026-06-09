# Milan Safety Map

Interactive experimental map and dashboard for exploring simulated Milan incident hotspots, temporal patterns, and data-source provenance links.

## What This Is

This is a static frontend prototype. It combines a Leaflet map, Chart.js dashboards, seeded synthetic incident rows, and links to public source references such as ISTAT, Ministero dell'Interno, Il Sole 24 Ore, OpenStreetMap, and CARTO.

The incident rows are not official incident-level records. They are synthetic demonstration rows derived from public aggregate-context references and should be treated as illustrative test data.

## Important Disclaimer

This project is experimental and educational. It is not legal advice, safety advice, travel advice, policing guidance, risk scoring guidance, or an official public-safety product.

Do not use this project to make real-world safety, legal, law-enforcement, insurance, housing, employment, travel, investment, or personal-risk decisions. Data and code may contain errors, simplifications, stale references, or synthetic assumptions.

Always consult current news, official public authorities, and authoritative data sources before relying on any safety-related information.

## Data Sources And Provenance

The app exposes source links directly in the UI. Current source references include:

- ISTAT Crimes Archive: https://www.istat.it/en/archivio/crimes
- ISTAT SDI Crime Metadata: https://www.istat.it/scheda-qualita/delitti-denunciati-allautorita-giudiziaria-da-polizia-di-stato-arma-dei-carabinieri-e-guardia-di-finanza/
- Ministero dell'Interno - Dati e statistiche: https://www.interno.gov.it/it/stampa-e-comunicazione/dati-e-statistiche
- Il Sole 24 Ore Crime Index - Milano: https://lab24.ilsole24ore.com/indice-della-criminalita/classifica/milano
- OpenStreetMap attribution: https://www.openstreetmap.org/copyright
- CARTO attribution: https://carto.com/attributions

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
