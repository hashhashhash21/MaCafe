# Cloudflare deployment checklist

- [ ] Create `marams-cafe-db` in D1.
- [ ] Replace the D1 placeholder ID in `wrangler.jsonc`.
- [ ] Run `npm run cf:db:migrate`.
- [ ] Set `ADMIN_PASSWORD` with `wrangler secret put`.
- [ ] Set a long random `ADMIN_CONFIG_ENCRYPTION_KEY` with `wrangler secret put`.
- [ ] Set `ANAM_API_KEY`, or save it after login through the Admin panel.
- [ ] Run `npm run build`.
- [ ] Run `npm run deploy`.
- [ ] Open the site, log into Admin, use **Test Anam connection**, then save.
- [ ] Test voice → cart → confirmation → D1 order → printable invoice.
