## Config
- Build: `npx next build` (also runs `prisma generate`)
- Test: `npx vitest run`
- Lint: part of `next build`, configured via `eslint.config.mjs`
- TypeScript: `tsconfig.json` excludes `NgowamixMobile/`

## Common Issues & Fixes

### Prisma `findUnique` with non-unique field
Use `findFirst` instead of `findUnique` when the `where` field is not `@unique` (e.g., `ownerId`). Prisma throws if the field isn't unique.

### `NodeJS.Timeout`
Use `ReturnType<typeof setTimeout>` instead — `NodeJS.Timeout` isn't available in browser/edge environments.

### `any` in test mocks
Acceptable — avoids coupling tests to Prisma-generated types. Use `Record<string, unknown>` + `as any` for mock objects.

### Test mock setup for `payment-verify.test.ts`
This test mocks `db` with `mockDb()` which sets all methods as `vi.fn()`. Additional mocks needed per test case:
- `db.transaction.findUnique` — always needs `mockResolvedValue`
- `db.concert.findUnique` — needs concert object with `date`, `title`, `venue`, `city`, `time`, `artistId`
- `db.ticket.findMany` — needs `mockResolvedValue` for TICKET_PURCHASE path
- `@/lib/email` — must be mocked in `setup.ts` (dynamic import in route)

### ESLint
Flat config `eslint.config.mjs` at root. `no-console: warn`, `@next/next/no-img-element: off`.

### docker-compose
Use `${VAR:?error}` for secrets instead of hardcoding.

## Security Hardening Applied

### Auto-fulfill payment fallback removed
`payment/verify/route.ts` no longer auto-fulfills TICKET_PURCHASE after 2 min timeout when PawaPay is down. Remove this kind of fallback — it bypasses payment verification.

### Path traversal in file upload
Always sanitize user-supplied filenames. Use `crypto.randomUUID() + ext` in `upload.ts`. Never trust `file.name`.

### PII in logs
Mask phone numbers (`sms.ts`), remove emails from cron logs (`premium-expiry/route.ts`), remove emails from error logs (`forgot-password/route.ts`). Never log verification codes or email addresses.

### Webhook HMAC mandatory
HMAC signature verification (`payment/webhook/route.ts`, `email/inbound/route.ts`) must be required, not optional. If the secret env var is empty, return 500 — don't skip verification.

### Rate limiting
In-memory `Map` works for single-instance dev but is ineffective on Vercel serverless. Periodically clean up expired entries (`rate-limit.ts`). For production, use Vercel KV or a DB table.

### Password consistency
Minimum password length must be consistent across all endpoints: 8 chars (register + reset-password).

### CSP hardened
Removed `'unsafe-eval'` from `script-src` in `next.config.js`.

### SameSite cookies
Use `sameSite: 'strict'` consistently (was `lax` on login, `strict` on logout). Use `__Host-` prefix for cookies in production.

### Avatar proxy SSRF
Domain allowlist must check exact match or single-level subdomain (`parsed.hostname.split('.' + d).length === 2`) to prevent `utfs.io.evil.com` bypass.

### Seed credentials
Wrap test credentials display in `if (process.env.NODE_ENV === 'development')` to prevent leaking in CI/CD logs.

### JWT secret
Generate with `openssl rand -base64 32` for production. Never commit the real secret. Use Vercel environment variables.
