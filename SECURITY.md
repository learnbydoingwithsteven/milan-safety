# Security

## Scope

This is a static experimental frontend. It does not provide authentication, collect personal data, process payments, or operate a backend API.

## Known Limitations

- The app loads official annual aggregate records from Comune di Milano DS564 at runtime.
- DS564 is not an incident-level feed and does not provide hour, day, exact month, street, district, or coordinate fields.
- Runtime data loading depends on third-party public endpoints and may fail because of network, CORS, source availability, or upstream schema changes.
- The app loads third-party frontend assets from CDNs.
- The map and dashboard are not suitable for operational, legal, public-safety, travel, or risk-scoring decisions.

## Defensive Measures

- External links use `rel="noopener noreferrer"`.
- Rendered dynamic strings are HTML-escaped before insertion into popup, summary, and feed templates.
- External source URLs are restricted to `http:` and `https:` before rendering.
- Data loading has no generated-record fallback; when official data cannot be loaded, the UI shows a source error and links to the official dataset.
- Promotional media, screenshots, generated video/audio, and original prompt material are excluded from git via `.gitignore`.

## Reporting

If you find a security issue in this prototype, do not rely on the app for real-world safety decisions. Open an issue or contact the repository owner with reproduction steps and affected files.
