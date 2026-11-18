# PostgreSQL setup and verification

Use Node.js 22.13 or newer. The application now uses PostgreSQL only. Supabase credentials are no longer used by any application route, page or login flow.

## Configuration

Set `DATABASE_URL`, or set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env.local` / your deployment secret store. When both exist, the complete `DB_*` configuration takes precedence. No credentials are included in the repository. Set `DB_SSL=true` for a remote database requiring verified TLS; local connections default to no TLS.

Set `APP_ORIGIN` to the exact browser origin in production (for example `https://your-domain.example`, without a trailing slash). State-changing requests must carry this Origin. Production requires HTTPS because session cookies are Secure.

## First administrator

1. Back up your database using your normal procedure.
2. Run `npm run db:migrate`. This adds only `admin_accounts`, `admin_sessions`, and `admin_login_attempts`; it does not change products, staff, or activities. The SQL is under `supabase/migrations/20261113_admin_auth.sql` alongside the historical migrations, but requires only PostgreSQL.
3. Run `npm run admin:create` in an interactive terminal. Enter the chosen username/email and a password of 12–256 characters. Password entry is hidden; do not put passwords in command arguments or chat.
4. Open `/admin/login` and sign in with that exact username/email. The old automatic email suffix is no longer applied.

No default administrator or default password is created. Public `TB_USERS` staff entries do not grant login permissions. Passwords use salted scrypt; only hashed session tokens are stored. Sessions expire after 8 hours, are revoked on logout and password reset, and check active account/role on every protected API call. Login attempts are limited to 10 per account per 15-minute window across application instances. Add trusted edge/IP rate limiting if the site is exposed to heavy login traffic.

To reset an existing password explicitly: `npm run admin:create -- --reset`. This does not reactivate a disabled account or change its role. Disable an account through controlled database administration using `is_active = false`.

## Helpdesk user accounts

1. Make sure the authentication and existing helpdesk migrations have already been applied.
2. Apply `supabase/migrations/20261116_helpdesk_flow_hardening.sql`. It adds idempotency and repair-resolution fields without deleting existing tickets.
2. Run `npm run user:create` in an interactive terminal. Enter the user's username/email and a password of 12–256 characters. Password entry is hidden.
3. The user opens `/helpdesk/login`, signs in, and is redirected to `/helpdesk/new` to complete the repair request form.

Helpdesk users have the `viewer` role and cannot access administrator pages or APIs. The repair-ticket API requires a valid helpdesk or administrator session; anonymous ticket creation is disabled. Reset a helpdesk user's password with `npm run user:create -- --reset`.

## Data and access

`/api/admin/save` requires an admin session for both reads and writes. Its tables/columns are explicitly listed in `src/lib/table-columns.ts`. When adding a schema column, update its migration and this list together. SQL values are bound parameters. Writes run in transactions, never truncate text silently, never discard unknown fields, and never retry against another database.

Category, brand and option GET endpoints return only public active records, except `categories?all=true`, which requires admin. Website software/topic reads use `/api/catalog`; it cannot read staff or authentication tables. Public activity reads enforce `is_active`, support server-side filters/sorting/pagination, and omit gallery/content from list pages. The gallery is fetched on demand. `/api/test-db` returns 404 in production and requires admin in development. `/test-supabase` is retired (404).

Existing database tables and columns from the earlier migrations must still exist. Missing columns now produce a failure instead of a misleading partial save. No live data migration or account creation occurs during build/test.

## Checks

Run `npm run check` for TypeScript and regression tests, and `npm run build` for a production build. Tests use mocked database connections; they do not write to your database. CI runs these checks on pushes and pull requests.

After local setup, verify sign-in, unauthorized API rejection, admin create/edit/delete, an empty activity search, category/sort/page changes, gallery open/close, Tab focus staying inside dialogs, Escape close, and focus returning to the opening control. Public endpoints must not reveal inactive activities, even when an ID is supplied directly.
