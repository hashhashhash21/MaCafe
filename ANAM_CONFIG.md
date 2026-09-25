# Anam configuration — Maram's Cafe Cloudflare

Runtime IDs are provided as non-secret Worker variables in `wrangler.jsonc` and can be changed later from the authenticated Admin page.

- Avatar ID: `f01c2101-bdf3-4766-9f2a-ed07fa5fe139`
- Agent/share reference: `c38d14db-f0be-457a-90b0-87351d210591`
- Voice ID: `c48c4dd9-5050-11f1-9076-5e955d484d11`
- LLM ID: `a7cf662c-2ace-4de1-a21e-ef0fbf144bb7`
- API key: never included in this package. Add it as a Cloudflare secret or save it through Admin.

Admin-saved Anam settings are encrypted before storage in D1 using `ADMIN_CONFIG_ENCRYPTION_KEY`.
