# XerinPay web — how this frontend is wired

## Setup

```bash
npm install @tanstack/react-query -w apps/web
```

Create `apps/web/.env.local`:

```
API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Wrap the root layout's children in `<Providers>` from `@/app/providers`, and
delete `apps/web/app/page.tsx` (the landing page now lives at
`app/(marketing)/page.tsx`; two files cannot both own `/`).

## The one file to check first

`lib/api/endpoints.ts` holds **every** Django path. Nothing else in the app
hard-codes a URL. If a route 404s, fix it there and the whole app follows.

`lib/api/types.ts` is the matching contract for field names. Adjust it to your
serializers rather than sprinkling `any` through the pages.

## How a request actually flows

```
browser  →  /api/proxy/<django-path>  →  Django
             (Next route handler)
             attaches Bearer token from httpOnly cookie
             refreshes it transparently on 401
             rejects unsafe methods without a CSRF header
```

The browser never holds a token. `lib/api/client.ts` only ever talks to
`/api/proxy`. Consequences worth knowing:

- An XSS bug cannot exfiltrate a session — there is nothing in JS to steal.
- The Django origin is never exposed to the browser, so there is no CORS surface
  to misconfigure.
- Every POST carries an `Idempotency-Key`, so a retry cannot double-charge.

Auth-specific routes live under `app/api/auth/` — `login`, `mfa`, `logout`,
`session`. Login returns `mfa_required` when a second factor is needed; no
session cookie is set until the OTP verifies.

## Authorisation

`lib/rbac/permissions.ts` mirrors `apps/rbac/catalog.py`. The UI never checks a
role name — only permission strings — so an admin can invent
"Senior Finance Officer" in the role builder and the interface adapts with no
code change.

```tsx
const { has } = usePermissions();
<Can I="refunds.approve"> … </Can>
```

**These are usability gates, not security.** Hiding a button stops a colleague
from clicking something they cannot do; it stops nobody determined. Every check
here must also exist on the Django view.

Two safety features worth keeping:

- `SEGREGATION_CONFLICTS` — the role builder warns when someone is given both
  `refunds.create` and `refunds.approve` (and similar pairs). It does not block
  the save; it makes the choice deliberate and auditable.
- `STEP_UP_REQUIRED` — permissions marked here should demand a fresh password +
  MFA at the moment of use. The UI flags them; **the backend must enforce it.**

## Structure

```
app/
  (marketing)/          public landing page
  login, register, forgot-password
  api/auth/*            session cookie handlers
  api/proxy/[...path]   authenticated proxy to Django
  dashboard/*           merchant portal
  admin/*               internal staff portal
components/
  shared/               DataTable, MetricCard, StatusBadge, states
  shell/                sidebar, header, user menu (both portals)
  charts/               volume, provider performance
  rbac/role-builder     dynamic permission composer
lib/
  api/                  endpoints, types, client, queries
  rbac/                 permission catalog and gating
  server/               cookie + backend helpers (server-only)
middleware.ts           route guards + CSP/HSTS
```

`middleware.ts` also routes staff to `/admin` and merchants to `/dashboard`, so
neither audience lands in the other's shell.

## Conventions

- **Money is integer minor units.** Use `formatMoney` for display; never do
  arithmetic on a formatted value.
- **Status is never colour alone.** `StatusBadge` always pairs a colour with an
  icon and a word.
- **Tables are server-paginated.** Client-side sorting of one page would lie
  about the other pages, so it is deliberately absent.
- **Charts use one axis.** Never a dual-axis chart; two measures of different
  scale get two charts.

## Not built yet

Nav links only point at pages that exist. Still to come: merchant business
profile and team settings, admin analytics, provider accounts / routing rules /
logs, payment attempts browser, payouts, staff activity, admin developer apps
and API logs, system settings, notifications centre.
