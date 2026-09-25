# Maram's Cafe — Cloudflare v27

Cloudflare Workers edition of Maram's Cafe. The customer UI and Anam SDK remain intact, while persistent server state has been migrated from local SQLite to Cloudflare D1.

## Cloud architecture

- Cloudflare Workers + vinext for the Next.js-compatible application runtime
- Cloudflare D1 binding `DB` for inventory, orders, admin sessions, login throttling, and encrypted Anam settings
- Anam API key stays server-side; Admin can replace it without rebuilding the site
- AES-GCM encryption for saved Anam configuration using `ADMIN_CONFIG_ENCRYPTION_KEY`
- Static product images deploy with the Worker
- Printable bilingual invoice is Worker-safe: use the browser's Print / Save as PDF action

## First deployment

1. Install dependencies:
   `npm install`
2. Authenticate Wrangler:
   `npx wrangler login`
3. Create D1:
   `npx wrangler d1 create marams-cafe-db`
4. Copy the returned `database_id` into `wrangler.jsonc`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.
5. Apply the schema:
   `npm run cf:db:migrate`
6. Add secrets (never commit them):
   `npx wrangler secret put ADMIN_PASSWORD`
   `npx wrangler secret put ADMIN_CONFIG_ENCRYPTION_KEY`
   Optionally bootstrap Anam with `npx wrangler secret put ANAM_API_KEY`. You can instead save/replace the Anam key later from Admin.
7. Deploy:
   `npm run deploy`

The initial Admin password is whatever you enter for the `ADMIN_PASSWORD` secret. If you want `12341` for testing, enter that when Wrangler asks. Use a stronger password for a public site.

## Local Cloudflare development

Copy `.dev.vars.example` to `.dev.vars`, fill local-only values, then run:
`npm run cf:db:migrate:local`
`npm run dev`

`.dev.vars` is ignored by Git.

## GitHub

Commit the extracted project contents. Do not commit `.dev.vars`, `.env.local`, API keys, passwords, `.wrangler`, build output, or database files.

For GitHub Actions deployment, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets after the D1 database ID is configured in `wrangler.jsonc`.

## Important production notes

Online payment remains disabled until a real payment-provider integration is completed. ZATCA cryptographic signing/reporting/clearance remains intentionally disabled; the current route does not claim a successful submission. The invoice endpoint renders a bilingual printable invoice because local Edge/Chromium executable spawning is not available inside Workers.
