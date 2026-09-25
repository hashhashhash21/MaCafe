# Cloudflare deployment

1. `npm install`
2. `npx wrangler login`
3. `npx wrangler d1 create marams-cafe-db`
4. Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `wrangler.jsonc`.
5. `npm run cf:db:migrate`
6. `npx wrangler secret put ADMIN_PASSWORD`
7. `npx wrangler secret put ADMIN_CONFIG_ENCRYPTION_KEY`
8. Optional: `npx wrangler secret put ANAM_API_KEY`
9. `npm run deploy`

For GitHub Actions also configure repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
