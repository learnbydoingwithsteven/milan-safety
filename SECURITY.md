# Security

## Scope

This is a static experimental frontend. It does not provide authentication, collect personal data, process payments, or operate a backend API.

## Known Limitations

- Incident rows are synthetic demonstration data.
- Public source links are references, not live official incident feeds.
- The app loads third-party frontend assets from CDNs.
- The map and dashboard are not suitable for operational, legal, public-safety, travel, or risk-scoring decisions.

## Defensive Measures

- External links use `rel="noopener noreferrer"`.
- Rendered dynamic strings are HTML-escaped before insertion into popup and feed templates.
- External source URLs are restricted to `http:` and `https:` before rendering.
- Promotional media, screenshots, generated video/audio, and original prompt material are excluded from git via `.gitignore`.

## Reporting

If you find a security issue in this prototype, do not rely on the app for real-world safety decisions. Open an issue or contact the repository owner with reproduction steps and affected files.
