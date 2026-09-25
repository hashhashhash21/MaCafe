# v27 Cloudflare edition

- Renamed deployment package to Maram's Cafe.
- Replaced local `node:sqlite` persistence with Cloudflare D1.
- Converted admin sessions, login throttling, inventory, orders, and Anam config to D1.
- Retained encrypted server-side Anam API configuration.
- Added Cloudflare Workers/vinext configuration.
- Added D1 schema migration.
- Added GitHub Actions Cloudflare deployment workflow.
- Removed runtime dependencies on local executable browser/PDF generation.
- Invoice route now returns a bilingual printable HTML invoice suitable for Print / Save as PDF.
- No real API keys or passwords are included.
