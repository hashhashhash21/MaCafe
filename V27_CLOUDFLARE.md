# v27 Cloudflare conversion

- Renamed deployment package to Maram's Cafe.
- Migrated inventory, orders, order lines, Admin sessions, login throttling and Anam configuration to Cloudflare D1.
- Removed runtime dependencies on `node:sqlite`, local filesystem storage, and local browser executables.
- Kept server-side Anam API-key handling and encrypted Admin configuration.
- Added vinext + Cloudflare Vite/Wrangler configuration.
- Added D1 migration and GitHub Actions deployment workflow.
- Replaced executable-browser PDF generation with a Worker-safe bilingual printable invoice / Save as PDF page.
- No real API key or password is included in the package.
